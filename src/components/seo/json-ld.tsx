type JsonLdValue = Record<string, unknown>;

/** Renders JSON-LD; React 19 hoists these script tags into document head. */
export const JsonLd = ({ data }: { data: JsonLdValue | JsonLdValue[] }) => {
    const items = Array.isArray(data) ? data : [data];

    return (
        <>
            {items.map((item, index) => (
                <script
                    // eslint-disable-next-line react/no-danger
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
                    key={item["@type"] ? `${String(item["@type"])}-${index}` : index}
                    type="application/ld+json"
                />
            ))}
        </>
    );
};
