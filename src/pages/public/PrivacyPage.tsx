import { Fragment } from "react";
import { useTranslation } from "react-i18next";

import type { SupportedLanguage } from "../../shared/i18n/resources";
import { privacyPolicyContent } from "./privacyPolicyContent";

type MarkdownBlock =
    | { type: "heading"; level: 1 | 2 | 3; text: string }
    | { type: "paragraph"; lines: string[] }
    | { type: "list"; items: string[] }
    | { type: "table"; headers: string[]; rows: string[][] };

function isTableLine(line: string) {
    return line.trim().startsWith("|") && line.trim().endsWith("|");
}

function isTableSeparator(line: string) {
    return /^\|?\s*:?-{3,}:?(\s*\|\s*:?-{3,}:?)*\s*\|?$/.test(
        line.trim(),
    );
}

function splitTableRow(line: string) {
    return line
        .trim()
        .replace(/^\|/, "")
        .replace(/\|$/, "")
        .split("|")
        .map((cell) => cell.trim());
}

function parsePrivacyMarkdown(markdown: string): MarkdownBlock[] {
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

export function PrivacyPage() {
    const { i18n } = useTranslation();
    const currentLanguage: SupportedLanguage =
        i18n.resolvedLanguage === "en" ? "en" : "it";
    const blocks = parsePrivacyMarkdown(privacyPolicyContent[currentLanguage]);

    return (
        <main className="sl-legal-page container py-5">
            <article className="sl-legal-document" aria-label="Privacy Policy">
                {blocks.map((block, blockIndex) => {
                    if (block.type === "heading") {
                        const HeadingTag = `h${block.level}` as
                            | "h1"
                            | "h2"
                            | "h3";

                        return (
                            <HeadingTag
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
                                        <tr key={`${row.join("-")}-${rowIndex}`}>
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