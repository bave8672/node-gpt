import promptSync from "prompt-sync";

const prompt = promptSync({ sigint: true });
const STOP_PATTERN = /^no?|stop|q(uit)?|end|finish|done|complete$/im;

export async function getFeedback({ name }: { name: string }) {
  const text = await prompt(
    `[${name}] Write feedback here, leave blank to continue, or type 'Stop' to finish: `
  );
  return {
    text,
    continue: !STOP_PATTERN.test(text),
  };
}
