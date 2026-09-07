export interface ValidationRule {
  type: "pattern" | "custom" | "minLength" | "maxLength" | "min" | "max";
  value?: string | number | RegExp;
  message: string;
  validator?: (value: any) => boolean;
}

export interface FieldValidationConfig {
  required?: boolean;
  rules?: ValidationRule[];
  validateOn?: "blur" | "change" | "submit";
}

export const IBAN_PATTERN = /^[A-Z]{2}[0-9]+$/;

export function validateIBAN(value: string): { valid: boolean; message?: string } {
  if (!value) return { valid: true };
  if (!IBAN_PATTERN.test(value.replace(/\s/g, "").toUpperCase())) {
    return {
      valid: false,
      message: "Please enter a valid IBAN starting with 2 letters followed by digits.",
    };
  }
  return { valid: true };
}

export function validateEmail(value: string): { valid: boolean; message?: string } {
  if (!value) return { valid: true };
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(value)) {
    return { valid: false, message: "Please enter a valid email address." };
  }
  return { valid: true };
}

export function validateRequired(value: any): { valid: boolean; message?: string } {
  if (value === undefined || value === null || value === "") {
    return { valid: false, message: "This field is required." };
  }
  if (Array.isArray(value) && value.length === 0) {
    return { valid: false, message: "At least one entry is required." };
  }
  return { valid: true };
}

export function runFieldValidations(
  value: any,
  config: FieldValidationConfig
): { valid: boolean; messages: string[] } {
  const messages: string[] = [];

  if (config.required) {
    const reqResult = validateRequired(value);
    if (!reqResult.valid && reqResult.message) {
      messages.push(reqResult.message);
    }
  }

  if (config.rules) {
    for (const rule of config.rules) {
      let ruleValid = true;

      switch (rule.type) {
        case "pattern":
          if (typeof value === "string" && rule.value instanceof RegExp) {
            ruleValid = (rule.value as RegExp).test(value);
          }
          break;
        case "custom":
          if (rule.validator) {
            ruleValid = rule.validator(value);
          }
          break;
        case "minLength":
          if (typeof value === "string") {
            ruleValid = value.length >= (rule.value as number);
          }
          break;
        case "maxLength":
          if (typeof value === "string") {
            ruleValid = value.length <= (rule.value as number);
          }
          break;
        case "min":
          if (typeof value === "number") {
            ruleValid = value >= (rule.value as number);
          }
          break;
        case "max":
          if (typeof value === "number") {
            ruleValid = value <= (rule.value as number);
          }
          break;
      }

      if (!ruleValid && rule.message) {
        messages.push(rule.message);
      }
    }
  }

  return { valid: messages.length === 0, messages };
}

export const DEFAULT_VALIDATION_CONFIGS: Record<string, FieldValidationConfig> = {
    iban: {
        rules: [
            { type: "custom", validator: (v: string) => validateIBAN(v).valid, message: "Please enter a valid IBAN starting with 2 letters followed by digits." },
        ],
    },
    email: {
        rules: [
            { type: "custom", validator: (v: string) => validateEmail(v).valid, message: "Please enter a valid email address." },
        ],
    },
};

// `getValidationConfig` returns *extra* rules (e.g. IBAN/email format checks)
// keyed off the field key. It deliberately does NOT force `required: true`
// — required-ness is decided by the schema's `field.required` flag in
// `validateFormAnswers`. Forcing required-by-key here used to spuriously
// block submission on optional fields like `contact_phone`, `country`,
// `contact_person_name` whenever the supplier left them blank, which
// surfaced as a 500 / "Could not submit" with no inline guidance.
export function getValidationConfig(fieldKey: string): FieldValidationConfig | null {
    if (fieldKey.includes("iban")) return DEFAULT_VALIDATION_CONFIGS.iban;
    if (fieldKey.includes("email")) return DEFAULT_VALIDATION_CONFIGS.email;
    return null;
}