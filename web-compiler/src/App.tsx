import { useState, useEffect, useRef, MouseEvent } from "react";
import { FixedSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import Simulator, { MEMORY_SIZE, hex } from "./simulator/Simulator";
import Logger, { Log, LogKind } from "./logger/Logger";
import parse from "./assembler/parse";
import translate from "./assembler/translate";
import { and_then } from "./assembler/result";
import "./App.css";

const logger = new Logger();
const simulator = new Simulator(logger);

logger.info(
  "Hit CTRL + Enter in the editor to load the program into the simulator."
);

const templatePrograms = {
  addition: `ORG 5
LDA A
ADD B
STA C
HLT

A, DEC 1
B, DEC 2
C, DEC 0

END`,
  
  subtraction: `ORG 5
LDA SUB
CMA
INC
ADD MIN
STA DIF
HLT

MIN, DEC 83
SUB, DEC -23
DIF, HEX 0

END`,
  
  division: `ORG 5
LOAD A
DIVIDE B
STORE RESULT
HALT

A, DEC 10
B, DEC 2
RESULT, HEX 0

END`,

  add100Numbers: `ORG 5
LDA ADS
STA PTR
LDA NBR
STA CTR
CLA
LOP, ADD PTR
ISZ PTR
ISZ CTR
BUN LOP
STA SUM
HLT

ADS, HEX 150
PTR, HEX 0
NBR, DEC -100
CTR, HEX 0
SUM, HEX 0

ORG 150
DEC 75
DEC 23

END`,

  multiplication: `ORG 5
LOP, CLE
LDA Y
CIR
STA Y
SZE
BUN ONE
BUN ZRO

ONE, LDA X
ADD P
STA P

CLE

ZRO, LDA X
CIL
STA X
ISZ CTR
BUN LOP
HLT

CTR, DEC 8
X, HEX 000F
Y, HEX 000B
P, HEX 0

END`,

  logicAND: `ORG 5
LDA A
AND B
STA RESULT
HLT

A, HEX XXXX
B, HEX XXXX
RESULT, HEX 0

END`,

  logicOR: `ORG 5
LDA A
CMA
STA TMP
LDA B
CMA
AND TMP
CMA
STA RESULT
HLT

A, HEX 0000
B, HEX 1010
TMP, HEX 0
RESULT, HEX 0

END`,

  logicNOT: `ORG 5
LDA A
CMA
STA RESULT
HLT

A, HEX XXXX
RESULT, HEX 0

END`,

  logicXOR: `ORG 5
LDA A
STA TMP1
LDA B
STA TMP2
LDA TMP1
CMA
AND TMP2
STA TMP3
LDA TMP2
CMA
AND TMP1
OR TMP3
STA RESULT
HLT

A, HEX XXXX
B, HEX XXXX
TMP1, HEX 0
TMP2, HEX 0
TMP3, HEX 0
RESULT, HEX 0

END`,

  repeatedAdditionMultiplication: `ORG 5
LDA A
SZA
BUN NZR
HLT

NZR, STA CTR
CLA
LOP, ADD B
ISZ CTR
BUN LOP
HLT

A, DEC 0
B, DEC 0
CTR, HEX 0

END`
};


type ProgramType = keyof typeof templatePrograms;

function App() {
  const [simulatorState, setSimulatorState] = useState(simulator.state());
  const [sourceCode, setSourceCode] = useState("");
  const [executeReady, setExecuteReady] = useState(false);
  const [logs, setLogs] = useState(logger.logs());
  const logsBottomRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    logsBottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [logs]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const programType = urlParams.get("program") as ProgramType | null;

    if (programType && templatePrograms[programType]) {
      setSourceCode(templatePrograms[programType]);
    }
  }, []);

  const handleInput = (e: any) => {
    simulator.setInput(e.target.value);
    setSimulatorState(simulator.state());
  };

  const handleStep = (step: () => void) => () => {
    step.call(simulator);
    const state = simulator.state();
    setSimulatorState(state);
    setExecuteReady(simulator.isRunning());
    setLogs(logger.logs());
  };

  const lineFormat = (line: string): string => {
    const LABEL_COMMA = /^[A-Z][0-9A-Z]{0,2},/;

    const _line = line.trim().toUpperCase();

    if (_line.startsWith("/")) return line;

    const label = _line.match(LABEL_COMMA);

    if (label === null) return "\t" + line;

    return label.toString() + "\t" + _line.replace(LABEL_COMMA, "").trimStart();
  };

  const handleEditorKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement> | undefined
  ) => {
    if (e === undefined) return;

    if (e.key === "Tab") {
      e.preventDefault();
      const editor = e.currentTarget;
      const content = editor.value;
      const start = editor.selectionStart;
      const end = editor.selectionEnd;
      editor.value =
        content.substring(0, start) + "\t" + content.substring(end);
      editor.selectionStart = editor.selectionEnd = start + 1;
    } else if (e.key === "Enter" && e.ctrlKey) {
      logger.clear();

      const result = and_then(parse(sourceCode), translate);
      if (!result.ok) {
        logger.error(result.error);
        setExecuteReady(false);
        setLogs(logger.logs());
        return;
      }

      const program = result.value;

      simulator.load(program);
      setExecuteReady(simulator.isRunning());
      setSimulatorState(simulator.state());
      setLogs(logger.logs());
    } else if (e.key.toUpperCase() === "F" && e.ctrlKey && e.shiftKey) {
      const editor = e.currentTarget;
      const content = editor.value;

      editor.value = content.split("\n").map(lineFormat).join("\n");
    }
  };

  return (
    <main>
      <div className="container">
        <fieldset className="editor">
          <legend>EDITOR</legend>
          <textarea
            onKeyDown={handleEditorKeyDown}
            onChange={(e: any) => setSourceCode(e.target.value)}
            value={sourceCode}
            spellCheck={false}
          ></textarea>
        </fieldset>

        <fieldset className="memory">
          <legend>MEMORY</legend>
          <Memory memory={simulatorState.memory} />
        </fieldset>

        <fieldset className="logs">
          <legend>LOGS</legend>
          {logs.map((log, index) => renderLog(log, index))}
          <div ref={logsBottomRef}></div>
        </fieldset>

        <fieldset className="registers">
          <legend>REGISTERS & FLAGS</legend>
          <div className="dr">
            <Register name="DR" value={simulatorState.registers.data} />
          </div>
          <div className="ar">
            <Register name="AR" value={simulatorState.registers.address} />
          </div>
          <div className="ac">
            <Register name="AC" value={simulatorState.registers.accumulator} />
          </div>
          <div className="ir">
            <Register name="IR" value={simulatorState.registers.instruction} />
          </div>
          <div className="pc">
            <Register name="PC" value={simulatorState.registers.program} />
          </div>
          <div className="tr">
            <Register name="TR" value={simulatorState.registers.temporary} />
          </div>
          <div className="inpr">
            <Register name="INPR" value={simulatorState.registers.input} />
          </div>
          <div className="outr">
            <Register name="OUTR" value={simulatorState.registers.output} />
          </div>
          <div className="t">
            <Register name="T" value={simulatorState.registers.time} />
          </div>
          <div className="i">
            <Flag name="I" value={simulatorState.flags.indirection} />
          </div>
          <div className="s">
            <Flag name="S" value={simulatorState.flags.stop} />
          </div>
          <div className="e">
            <Flag name="E" value={simulatorState.flags.overflow} />
          </div>
          <div className="r">
            <Flag name="R" value={simulatorState.flags.interrupt} />
          </div>
          <div className="ien">
            <Flag name="IEN" value={simulatorState.flags.interruptEnable} />
          </div>
          <div className="fgi">
            <Flag name="FGI" value={simulatorState.flags.input} />
          </div>
          <div className="fgo">
            <Flag name="FGO" value={simulatorState.flags.output} />
          </div>
        </fieldset>

        <div className="micro">
          <button
            disabled={!executeReady}
            type="button"
            value="MICROSTEP"
            onClick={handleStep(simulator.microStep)}
          >
            MICROSTEP
          </button>
        </div>

        <div className="macro">
          <button
            disabled={!executeReady}
            type="button"
            onClick={handleStep(simulator.macroStep)}
          >
            MACROSTEP
          </button>
        </div>

        <div className="execute">
          <button
            disabled={!executeReady}
            onClick={handleStep(simulator.execute)}
            type="button"
          >
            EXECUTE
          </button>
        </div>

        <fieldset className="output">
          <legend>OUTPUT STREAM</legend>
          {simulatorState.output}
        </fieldset>

        <fieldset className="input">
          <legend>INPUT STREAM</legend>
          <textarea
            spellCheck={false}
            onChange={handleInput}
            value={simulatorState.input}
          ></textarea>
        </fieldset>
      </div>
    </main>
  );
}

type RegisterProps<T> = {
  name: string;
  value: T;
};

const Register = ({ name, value }: RegisterProps<number>) => (
  <div className="register">
    <strong>{name}</strong>
    <span>{hex(value)}</span>
  </div>
);

const Flag = ({ name, value }: RegisterProps<boolean>) => (
  <div className="register">
    <strong>{name}</strong>
    <span>{value.toString()}</span>
  </div>
);

type AddressProps = {
  data: number[];
  index: number;
  style: any;
};

const Address = ({ data, index, style }: AddressProps): JSX.Element => (
  <div style={style} className="memory-cell">
    <strong>{hex(index)}</strong>
    <span>{hex(data[index] as number)}</span>
  </div>
);

type MemoryProps = { memory: number[] };

const Memory = ({ memory }: MemoryProps): JSX.Element => {
  return (
    <AutoSizer>
      {({ height, width }: { height: number; width: number }) => (
        <List
          width={width}
          height={height}
          itemCount={MEMORY_SIZE}
          itemData={memory}
          itemSize={25}
        >
          {Address}
        </List>
      )}
    </AutoSizer>
  );
};

const renderLog = (log: Log, key: number) => {
  switch (log.kind) {
    case LogKind.Step:
      return (
        <p key={key} className="log step">
          {log.step}
        </p>
      );
    case LogKind.Context:
      return (
        <p key={key} className="log context">
          [{log.title}:t{log.time}]
        </p>
      );
    case LogKind.Info:
      return (
        <p key={key} className="log info">
          [INFO]: {log.info}
        </p>
      );
    case LogKind.Warning:
      return (
        <p key={key} className="log warning">
          [WARNING]: {log.warning}
        </p>
      );
    case LogKind.Error:
      return (
        <p key={key} className="log error">
          [ERROR]: {log.error}
        </p>
      );
  }
};

export default App;
