class ManoMachine {
    private accumulator: number;
    private instructionRegister: number;
    private memoryBufferRegister: number;
    private programCounter: number;
    private memory: number[];

    constructor() {
        this.accumulator = 0;
        this.instructionRegister = 0;
        this.memoryBufferRegister = 0;
        this.programCounter = 0;
        this.memory = new Array(4096).fill(0); // Mano Machine has 4K memory
    }

    loadProgram(program: number[]) {
        for (let i = 0; i < program.length; i++) {
            this.memory[i] = program[i];
        }
    }

    fetch() {
        this.memoryBufferRegister = this.memory[this.programCounter];
        this.instructionRegister = this.memoryBufferRegister;
        this.programCounter++;
    }

     decode() {
        const opcode = (this.instructionRegister & 0xF000) >> 12;
        const address = this.instructionRegister & 0x0FFF;
        return { opcode, address };
    }

    execute(opcode: number, address: number) {
        let effectiveAddress = this.getEffectiveAddress(address);

        switch (opcode) {
            case 0x0: // AND
                this.accumulator &= this.memory[address];
                break;
            case 0x1: // ADD
                this.accumulator += this.memory[address];
                break;
            case 0x2: // LDA
                this.accumulator = this.memory[address];
                break;
            case 0x3: // STA
                this.memory[address] = this.accumulator;
                break;
            case 0x4: // BUN
                this.programCounter = address;
                break;
            case 0x5: // BSA
                this.memory[address] = this.programCounter;
                this.programCounter = address + 1;
                break;
            case 0x6: // ISZ
                this.memory[address]++;
                if (this.memory[address] === 0) {
                    this.programCounter++;
                }
                break;
                case 0x7: // JUMP
                this.programCounter = effectiveAddress;
                break;
            case 0x8: // JUMP IF ZERO
                if (this.accumulator === 0) {
                    this.programCounter = effectiveAddress;
                }
                break;
            case 0x9: // JUMP IF POSITIVE
                if (this.accumulator > 0) {
                    this.programCounter = effectiveAddress;
                }
                break;
        }
    }

    run() {
        while (this.programCounter < this.memory.length) {
            this.fetch();
            const { opcode, address } = this.decode();
            this.execute(opcode, address);
        }
    }
    private isIndirectAddressing(address: number): boolean {
        return (address & 0x8000) !== 0; // Check if the most significant bit is 1
    }

    private getEffectiveAddress(address: number): number {
        if (this.isIndirectAddressing(address)) {
            return this.memory[address & 0x7FFF]; // Indirect addressing
        }
        return address; // Direct addressing

}

const manoMachine = new ManoMachine();
const program = [0x1200, 0x5201, 0x3202, 0xE000]; 
manoMachine.loadProgram(program);
manoMachine.run();
