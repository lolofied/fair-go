import type { ReactNode } from "react";
import type { TemplateField } from "@/case/templates";
import { cx } from "@/utils/cx";

const controlClass =
    "w-full rounded-lg border border-primary bg-primary px-3 py-2 text-md text-primary shadow-xs outline-none transition duration-100 ease-linear placeholder:text-placeholder focus:border-brand focus:ring-2 focus:ring-brand/30";

const FieldShell = ({ label, help, htmlFor, children }: { label: string; help?: string; htmlFor?: string; children: ReactNode }) => (
    <div className="flex flex-col gap-1.5">
        <label htmlFor={htmlFor} className="text-sm font-medium text-secondary">
            {label}
        </label>
        {children}
        {help && <p className="text-xs text-tertiary">{help}</p>}
    </div>
);

interface BaseProps {
    id?: string;
    label: string;
    help?: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export const TextField = ({ id, label, help, value, onChange, placeholder }: BaseProps) => (
    <FieldShell label={label} help={help} htmlFor={id}>
        <input
            id={id}
            type="text"
            value={value}
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
            className={controlClass}
        />
    </FieldShell>
);

export const TextAreaField = ({ id, label, help, value, onChange, placeholder }: BaseProps) => (
    <FieldShell label={label} help={help} htmlFor={id}>
        <textarea
            id={id}
            rows={3}
            value={value}
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
            className={cx(controlClass, "resize-y")}
        />
    </FieldShell>
);

export const DateField = ({ id, label, help, value, onChange }: BaseProps) => (
    <FieldShell label={label} help={help} htmlFor={id}>
        <input id={id} type="date" value={value} onChange={(e) => onChange(e.target.value)} className={controlClass} />
    </FieldShell>
);

interface SelectProps extends BaseProps {
    options: { value: string; label: string }[];
}

export const SelectField = ({ id, label, help, value, onChange, options, placeholder }: SelectProps) => (
    <FieldShell label={label} help={help} htmlFor={id}>
        <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={cx(controlClass, "appearance-none")}>
            <option value="">{placeholder ?? "Select..."}</option>
            {options.map((o) => (
                <option key={o.value} value={o.value}>
                    {o.label}
                </option>
            ))}
        </select>
    </FieldShell>
);

/** Render a template field bound to an event's `fields` record. */
export const TemplateFieldInput = ({
    field,
    value,
    onChange,
}: {
    field: TemplateField;
    value: string;
    onChange: (value: string) => void;
}) => {
    const common = { id: field.id, label: field.label, help: field.help, value, onChange, placeholder: field.placeholder };
    switch (field.kind) {
        case "textarea":
            return <TextAreaField {...common} />;
        case "date":
            return <DateField {...common} />;
        case "yesno":
            return <SelectField {...common} options={field.options ?? []} placeholder="Select..." />;
        case "select":
            return <SelectField {...common} options={field.options ?? []} placeholder="Select..." />;
        default:
            return <TextField {...common} />;
    }
};
