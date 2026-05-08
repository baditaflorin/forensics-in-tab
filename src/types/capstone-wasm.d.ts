declare module 'capstone-wasm' {
  export interface Insn {
    id: number;
    address: number | bigint;
    size: number;
    bytes: Uint8Array;
    mnemonic: string;
    opStr: string;
  }

  export class Capstone {
    constructor(arch: number, mode: number);
    setOption(opt: number, value: unknown): number;
    close(): void;
    disasm(
      data: number[] | Uint8Array,
      options?: { address?: number | bigint; count?: number }
    ): Insn[];
  }

  export function loadCapstone(args?: Record<string, unknown>): Promise<void>;

  export const Const: {
    CS_ARCH_X86: number;
    CS_ARCH_ARM64: number;
    CS_MODE_16: number;
    CS_MODE_32: number;
    CS_MODE_64: number;
  };
}
