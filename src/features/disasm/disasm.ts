import { z } from 'zod';
import { bytesToHex, clampSlice, formatOffset, readUInt32LE } from '../../lib/bytes';

export type DisasmArchitecture = 'x86-16' | 'x86-32' | 'x86-64' | 'arm64';

export interface DisasmOptions {
  architecture: DisasmArchitecture;
  offset: number;
  length: number;
  address: number;
}

export interface DisasmInstruction {
  address: string;
  bytes: string;
  mnemonic: string;
  operands: string;
}

export interface DisasmResult {
  engine: 'capstone-wasm' | 'fallback-x86';
  instructions: DisasmInstruction[];
  warning?: string;
}

export const disasmInstructionSchema = z.object({
  address: z.string(),
  bytes: z.string(),
  mnemonic: z.string(),
  operands: z.string()
});

export const disasmResultSchema = z.object({
  engine: z.enum(['capstone-wasm', 'fallback-x86']),
  instructions: z.array(disasmInstructionSchema),
  warning: z.string().optional()
});

export async function disassemble(
  bytes: Uint8Array,
  options: DisasmOptions
): Promise<DisasmResult> {
  const slice = clampSlice(bytes, options.offset, options.length);

  try {
    return await disassembleWithCapstone(slice, options);
  } catch (error) {
    const warning = error instanceof Error ? error.message : 'Capstone WASM could not initialize.';
    return {
      engine: 'fallback-x86',
      instructions: fallbackX86(slice, options.address),
      warning
    };
  }
}

async function disassembleWithCapstone(
  bytes: Uint8Array,
  options: DisasmOptions
): Promise<DisasmResult> {
  const capstone = await import('capstone-wasm');
  await capstone.loadCapstone({
    print: () => undefined,
    printErr: () => undefined
  });

  const mode =
    options.architecture === 'x86-16'
      ? capstone.Const.CS_MODE_16
      : options.architecture === 'x86-32'
        ? capstone.Const.CS_MODE_32
        : capstone.Const.CS_MODE_64;
  const arch =
    options.architecture === 'arm64' ? capstone.Const.CS_ARCH_ARM64 : capstone.Const.CS_ARCH_X86;
  const handle = new capstone.Capstone(arch, mode);

  try {
    const instructions = handle
      .disasm(bytes, { address: options.address, count: 96 })
      .map((item) => ({
        address: formatOffset(Number(item.address)),
        bytes: bytesToHex(item.bytes),
        mnemonic: item.mnemonic,
        operands: item.opStr
      }));

    return { engine: 'capstone-wasm', instructions };
  } finally {
    handle.close();
  }
}

function fallbackX86(bytes: Uint8Array, baseAddress: number): DisasmInstruction[] {
  const instructions: DisasmInstruction[] = [];
  let cursor = 0;

  while (cursor < bytes.length && instructions.length < 96) {
    const address = baseAddress + cursor;
    const opcode = bytes[cursor];
    let size = 1;
    let mnemonic = 'db';
    let operands = `0x${opcode.toString(16).padStart(2, '0')}`;

    if (opcode === 0x90) {
      mnemonic = 'nop';
      operands = '';
    } else if (opcode === 0xcc) {
      mnemonic = 'int3';
      operands = '';
    } else if (opcode === 0xc3) {
      mnemonic = 'ret';
      operands = '';
    } else if (opcode === 0x55) {
      mnemonic = 'push';
      operands = 'rbp';
    } else if (opcode === 0x48 && bytes[cursor + 1] === 0x89 && bytes[cursor + 2] === 0xe5) {
      size = 3;
      mnemonic = 'mov';
      operands = 'rbp, rsp';
    } else if (opcode === 0x48 && bytes[cursor + 1] === 0x83 && bytes[cursor + 2] === 0xec) {
      size = 4;
      mnemonic = 'sub';
      operands = `rsp, 0x${bytes[cursor + 3].toString(16)}`;
    } else if (opcode === 0xe8 && cursor + 4 < bytes.length) {
      size = 5;
      mnemonic = 'call';
      operands = formatRelativeTarget(bytes, cursor, address);
    } else if (opcode === 0xe9 && cursor + 4 < bytes.length) {
      size = 5;
      mnemonic = 'jmp';
      operands = formatRelativeTarget(bytes, cursor, address);
    } else if (opcode === 0xeb && cursor + 1 < bytes.length) {
      size = 2;
      mnemonic = 'jmp';
      const displacement = (bytes[cursor + 1] << 24) >> 24;
      operands = formatOffset(address + size + displacement);
    }

    instructions.push({
      address: formatOffset(address),
      bytes: bytesToHex(bytes.slice(cursor, cursor + size)),
      mnemonic,
      operands
    });
    cursor += size;
  }

  return instructions;
}

function formatRelativeTarget(bytes: Uint8Array, cursor: number, address: number): string {
  const raw = readUInt32LE(bytes, cursor + 1);
  const displacement = raw > 0x7fffffff ? raw - 0x100000000 : raw;
  return formatOffset(address + 5 + displacement);
}
