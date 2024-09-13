import ora, { Ora, Color } from 'ora';

let spinner: Ora | null = null;

export function spinnerMessage(text: string, color?: Color) {
  if (!spinner) {
    spinner = ora(text).start();
  } else {
    spinner.text = text;
  }

  if (color) {
    spinner.color = color;
  }

  return spinner;
}

export function stopSpinner() {
  if (spinner) {
    spinner.stop();
    spinner = null;
  }
}
