import { Fragment } from "react";

type MarkdownBlock =
    | { type: "heading"; level: 1 | 2 | 3; text: string }
    | { type: "paragraph"; lines: string[] }
    | { type: "list"; items: string[] }
    | { type: "table"; headers: string[]; rows: string[][] };

type LegalMarkdownPageProps = {
    markdown: string;
    ariaLabel: string;
};

function isTableLine(line: string) {
    return line.trim().startsWith("|") && line.trim().endsWith("|");
}

function isTableSeparator(line: string) {
    return /^\|?\s*:?-{3,}:?(\s*\|\s*:?-{3,}:?)*\s*\|?$/.test(line.trim());
}

function splitTableRow(line: string) {
    return line
        .trim()
        .replace(/^\|/, "")
        .replace(/\|$/, "")
        .split("|")
        .map((cell) => cell.trim());
}

function parseLegalMarkdown(markdown: string): MarkdownBlock[] {
    const lines = markdown.split("\n");
    const blocks: MarkdownBlock[] = [];

    let paragraphLines: string[] = [];
    let listItems: string[] = [];

    function flushParagraph() {
        if (paragraphLines.length > 0) {
            blocks.push({ type: "paragraph", lines: paragraphLines });
            paragraphLines = [];
        }
    }

    function flushList() {
        if (listItems.length > 0) {
            blocks.push({ type: "list", items: listItems });
            listItems = [];
        }
    }

    for (let index = 0; index < lines.length; index += 1) {
        const line = lines[index];
        const trimmedLine = line.trim();

        if (trimmedLine.length === 0) {
            flushParagraph();
            flushList();
            continue;
        }

        const headingMatch = /^(#{1,3})\s+(.+)$/.exec(trimmedLine);

        if (headingMatch) {
            flushParagraph();
            flushList();
            blocks.push({
                type: "heading",
                level: headingMatch[1].length as 1 | 2 | 3,
                text: headingMatch[2],
            });
            continue;
        }

        if (trimmedLine.startsWith("- ")) {
            flushParagraph();
            listItems.push(trimmedLine.slice(2));
            continue;
        }

        if (
            isTableLine(trimmedLine) &&
            index + 1 < lines.length &&
            isTableSeparator(lines[index + 1])
        ) {
            flushParagraph();
            flushList();

            const headers = splitTableRow(trimmedLine);
            const rows: string[][] = [];
            index += 2;

            while (index < lines.length && isTableLine(lines[index])) {
                rows.push(splitTableRow(lines[index]));
                index += 1;
            }

            index -= 1;
            blocks.push({ type: "table", headers, rows });
            continue;
        }

        flushList();
        paragraphLines.push(trimmedLine);
    }

    flushParagraph();
    flushList();

    return blocks;
}

function renderParagraphLines(lines: string[]) {
    return lines.map((line, index) => (
        <Fragment key={`${line}-${index}`}>
            {index > 0 ? <br /> : null}
            {line}
        </Fragment>
    ));
}

function slugifyHeading(text: string) {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function getBaseHeadingId(text: string) {
    const sectionMatch = /^(\d+)\./.exec(text.trim());

    if (sectionMatch) {
        return `articolo-${sectionMatch[1]}`;
    }

    return slugifyHeading(text);
}

export function LegalMarkdownPage({
    markdown,
    ariaLabel,
}: LegalMarkdownPageProps) {
    const blocks = parseLegalMarkdown(markdown);
    const headingIdCounts = new Map<string, number>();

    function getUniqueHeadingId(text: string) {
        const baseId = getBaseHeadingId(text);
        const occurrence = headingIdCounts.get(baseId) ?? 0;

        headingIdCounts.set(baseId, occurrence + 1);

        return occurrence === 0 ? baseId : `${baseId}-${occurrence + 1}`;
    }

    return (
        <main className="sl-legal-page container py-5">
            <article className="sl-legal-document" aria-label={ariaLabel}>
                {blocks.map((block, blockIndex) => {
                    if (block.type === "heading") {
                        const HeadingTag = `h${block.level}` as
                            | "h1"
                            | "h2"
                            | "h3";

                        const headingId = getUniqueHeadingId(block.text);

                        return (
                            <HeadingTag
                                id={headingId}
                                key={`${block.text}-${blockIndex}`}
                                className={
                                    block.level === 1
                                        ? "sl-legal-title"
                                        : "sl-legal-heading"
                                }>
                                {block.text}
                            </HeadingTag>
                        );
                    }

                    if (block.type === "paragraph") {
                        return (
                            <p key={`paragraph-${blockIndex}`}>
                                {renderParagraphLines(block.lines)}
                            </p>
                        );
                    }

                    if (block.type === "list") {
                        return (
                            <ul key={`list-${blockIndex}`}>
                                {block.items.map((item, itemIndex) => (
                                    <li key={`${item}-${itemIndex}`}>{item}</li>
                                ))}
                            </ul>
                        );
                    }

                    return (
                        <div
                            key={`table-${blockIndex}`}
                            className="sl-legal-table-wrapper">
                            <table className="sl-legal-table">
                                <thead>
                                    <tr>
                                        {block.headers.map((header) => (
                                            <th key={header} scope="col">
                                                {header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {block.rows.map((row, rowIndex) => (
                                        <tr
                                            key={`${row.join("-")}-${rowIndex}`}>
                                            {block.headers.map(
                                                (header, cellIndex) => (
                                                    <td
                                                        key={`${header}-${cellIndex}`}>
                                                        {row[cellIndex] ?? ""}
                                                    </td>
                                                ),
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    );
                })}
            </article>
        </main>
    );
}
