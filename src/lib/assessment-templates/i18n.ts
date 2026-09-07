import type {
  AssessmentTemplateSchema,
  Block,
  Field,
  Lang,
  ModalField,
  Section,
  SelectOption,
  SubBlock,
  TableColumn,
  TableRowsField,
} from "./types";

/**
 * Get a localized string. English is canonical; German overrides are optional.
 */
export function pick(en: string | undefined, de: string | undefined, lang: Lang): string {
  if (lang === "de" && de) return de;
  return en ?? "";
}

function localizeOption(o: SelectOption, lang: Lang): SelectOption {
  if (!o.labelDe) return o;
  return { ...o, label: pick(o.label, o.labelDe, lang) };
}

function localizeColumn(c: TableColumn, lang: Lang): TableColumn {
  const next: TableColumn = { ...c };
  if (c.labelDe) next.label = pick(c.label, c.labelDe, lang);
  if (c.options) next.options = c.options.map((o) => localizeOption(o, lang));
  return next;
}

function localizeModalField(m: ModalField, lang: Lang): ModalField {
  const next: ModalField = { ...m };
  if (m.labelDe) next.label = pick(m.label, m.labelDe, lang);
  if (m.options) next.options = m.options.map((o) => localizeOption(o, lang));
  return next;
}

function localizeField(f: Field, lang: Lang): Field {
  const base = f as unknown as Record<string, unknown>;
  const next: Record<string, unknown> = { ...base };

  if (typeof base.label === "string") next.label = pick(base.label, base.labelDe as string | undefined, lang);
  if (typeof base.help === "string") next.help = pick(base.help, base.helpDe as string | undefined, lang);
  if (typeof base.helperText === "string") next.helperText = pick(base.helperText, base.helperTextDe as string | undefined, lang);

  if (f.type === "table_rows") {
    const tr = f as TableRowsField;
    if (tr.emptyStateDe) next.emptyState = pick(tr.emptyState, tr.emptyStateDe, lang);
    if (tr.addButtonLabelDe) next.addButtonLabel = pick(tr.addButtonLabel, tr.addButtonLabelDe, lang);
    next.columns = (tr.columns ?? []).map((c) => localizeColumn(c, lang));
  }

  if (f.type === "contact_table") {
    next.columns = ((f as { columns?: TableColumn[] }).columns ?? []).map((c) => localizeColumn(c, lang));
    const mf = (f as { modalFields?: ModalField[] }).modalFields;
    if (mf) next.modalFields = mf.map((m) => localizeModalField(m, lang));
  }

  if (Array.isArray(base.options)) {
    next.options = (base.options as SelectOption[]).map((o) => localizeOption(o, lang));
  }

  if (Array.isArray(base.subBlocks)) {
    next.subBlocks = (base.subBlocks as SubBlock[]).map((s) => localizeSubBlock(s, lang));
  }

  return next as unknown as Field;
}

function localizeSubBlock(s: SubBlock, lang: Lang): SubBlock {
  return {
    ...s,
    title: pick(s.title, s.titleDe, lang),
    fields: (s.fields ?? []).map((f) => localizeField(f, lang)),
  };
}

function localizeBlock(b: Block, lang: Lang): Block {
  return {
    ...b,
    title: pick(b.title, b.titleDe, lang),
    message: b.message !== undefined ? pick(b.message, b.messageDe, lang) : b.message,
    fields: (b.fields ?? []).map((f) => localizeField(f, lang)),
    subBlocks: (b.subBlocks ?? []).map((s) => localizeSubBlock(s, lang)),
  };
}

/**
 * Return a schema with all translatable strings resolved for the given language.
 * English returns the schema untouched (canonical source).
 */
export function localizeSchema(schema: AssessmentTemplateSchema, lang: Lang): AssessmentTemplateSchema {
  if (lang === "en") return schema;
  if (!schema.sections || !Array.isArray(schema.sections)) {
    return schema;
  }
  return {
    ...schema,
    sections: (schema.sections ?? []).map((sec: Section) => ({
      ...sec,
      title: pick(sec.title, sec.titleDe, lang),
      blocks: (sec.blocks ?? []).map((b) => localizeBlock(b, lang)),
    })),
  };
}
