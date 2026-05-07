import { useState } from "react";

type Op = "+" | "−" | "×" | "÷";

function compute(a: number, b: number, op: Op): number {
  switch (op) {
    case "+":
      return a + b;
    case "−":
      return a - b;
    case "×":
      return a * b;
    case "÷":
      return b === 0 ? NaN : a / b;
  }
}

function fmt(n: number): string {
  if (!isFinite(n)) return "Error";
  const s = n.toString();
  return s.length > 12 ? n.toExponential(6) : s;
}

function Btn({
  label,
  onClick,
  variant = "default",
  span = 1,
}: {
  label: string;
  onClick: () => void;
  variant?: "default" | "op" | "eq" | "clear";
  span?: 1 | 2;
}) {
  const base =
    "h-12 rounded text-base font-medium active:scale-95 transition-transform";
  const styles: Record<string, string> = {
    default: "bg-white/5 hover:bg-white/15",
    op: "bg-white/10 hover:bg-white/20",
    eq: "bg-blue-500/60 hover:bg-blue-500/80",
    clear: "bg-red-500/40 hover:bg-red-500/60",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${base} ${styles[variant]} ${span === 2 ? "col-span-2" : ""}`}
    >
      {label}
    </button>
  );
}

export function Calc() {
  const [display, setDisplay] = useState("0");
  const [stack, setStack] = useState<{ op: Op; value: number } | null>(null);
  const [reset, setReset] = useState(false);

  const inputDigit = (d: string) => {
    if (display === "0" || reset) {
      setDisplay(d);
      setReset(false);
    } else if (display.replace(/[-.]/g, "").length < 12) {
      setDisplay(display + d);
    }
  };

  const inputDot = () => {
    if (reset) {
      setDisplay("0.");
      setReset(false);
    } else if (!display.includes(".")) {
      setDisplay(display + ".");
    }
  };

  const inputOp = (op: Op) => {
    const cur = parseFloat(display);
    if (stack && !reset) {
      const result = compute(stack.value, cur, stack.op);
      setDisplay(fmt(result));
      setStack({ op, value: result });
    } else {
      setStack({ op, value: cur });
    }
    setReset(true);
  };

  const equals = () => {
    if (!stack) return;
    const cur = parseFloat(display);
    const result = compute(stack.value, cur, stack.op);
    setDisplay(fmt(result));
    setStack(null);
    setReset(true);
  };

  const clear = () => {
    setDisplay("0");
    setStack(null);
    setReset(false);
  };

  const negate = () => {
    if (display === "0" || display === "Error") return;
    setDisplay(display.startsWith("-") ? display.slice(1) : "-" + display);
  };

  const percent = () => {
    const cur = parseFloat(display);
    setDisplay(fmt(cur / 100));
    setReset(true);
  };

  return (
    <div className="h-full flex flex-col p-3 gap-2">
      <div className="text-right text-3xl font-mono px-3 py-3 bg-black/40 rounded truncate">
        {display}
      </div>
      <div className="grid grid-cols-4 gap-2 flex-1">
        <Btn label="C" onClick={clear} variant="clear" />
        <Btn label="±" onClick={negate} variant="op" />
        <Btn label="%" onClick={percent} variant="op" />
        <Btn label="÷" onClick={() => inputOp("÷")} variant="op" />

        <Btn label="7" onClick={() => inputDigit("7")} />
        <Btn label="8" onClick={() => inputDigit("8")} />
        <Btn label="9" onClick={() => inputDigit("9")} />
        <Btn label="×" onClick={() => inputOp("×")} variant="op" />

        <Btn label="4" onClick={() => inputDigit("4")} />
        <Btn label="5" onClick={() => inputDigit("5")} />
        <Btn label="6" onClick={() => inputDigit("6")} />
        <Btn label="−" onClick={() => inputOp("−")} variant="op" />

        <Btn label="1" onClick={() => inputDigit("1")} />
        <Btn label="2" onClick={() => inputDigit("2")} />
        <Btn label="3" onClick={() => inputDigit("3")} />
        <Btn label="+" onClick={() => inputOp("+")} variant="op" />

        <Btn label="0" onClick={() => inputDigit("0")} span={2} />
        <Btn label="." onClick={inputDot} />
        <Btn label="=" onClick={equals} variant="eq" />
      </div>
    </div>
  );
}
