import Database from "better-sqlite3";
import { parse } from "csv-parse/sync";
import fs from "fs";
import path from "path";

interface CsvRow {
  EKSAMI_SOORITAJA: string;
  KUUPAEV: string;
  BYROO: string;
  KATEGOORIA: string;
  ERITINGIMUSED: string;
  VIIMANE_AUTOKOOL: string;
  SOIDUOPETAJA_KAASAS: string;
  EKSAMINEERIJA: string;
  SEISUND: string;
  KESTUS: string;
  KATK_POHJUS: string;
  MITTEARVESTATUD: string;
  VEAD: string;
}

const projectRoot = path.join(__dirname, "..");
const dataDirectory = path.join(projectRoot, "data");
const databasePath = path.join(dataDirectory, "exams.db");

function emptyToNull(value: string | undefined): string | null {
  if (!value || value.trim() === "") {
    return null;
  }

  return value.trim();
}

function parseDuration(value: string | undefined): number | null {
  if (!value || value.trim() === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function loadCsvRows(filePath: string, year: number) {
  const content = fs.readFileSync(filePath, "utf8");
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as CsvRow[];

  return records.map((record) => ({
    eksami_sooritaja: record.EKSAMI_SOORITAJA,
    kuupaev: record.KUUPAEV,
    byroo: record.BYROO,
    kategooria: record.KATEGOORIA,
    eritingimused: emptyToNull(record.ERITINGIMUSED),
    viimane_autokool: emptyToNull(record.VIIMANE_AUTOKOOL),
    soiduopetaja_kaasas: emptyToNull(record.SOIDUOPETAJA_KAASAS),
    eksamineerija: record.EKSAMINEERIJA,
    seisund: record.SEISUND,
    kestus: parseDuration(record.KESTUS),
    katk_pohjus: emptyToNull(record.KATK_POHJUS),
    mittearvestatud: emptyToNull(record.MITTEARVESTATUD),
    vead: emptyToNull(record.VEAD),
    year,
  }));
}

function main() {
  fs.mkdirSync(dataDirectory, { recursive: true });

  if (fs.existsSync(databasePath)) {
    fs.unlinkSync(databasePath);
  }

  const sqlite = new Database(databasePath);

  sqlite.exec(`
    create table exams (
      id integer primary key autoincrement,
      eksami_sooritaja text not null,
      kuupaev text not null,
      byroo text not null,
      kategooria text not null,
      eritingimused text,
      viimane_autokool text,
      soiduopetaja_kaasas text,
      eksamineerija text not null,
      seisund text not null,
      kestus integer,
      katk_pohjus text,
      mittearvestatud text,
      vead text,
      year integer not null
    );

    create index idx_exams_year on exams(year);
    create index idx_exams_kategooria on exams(kategooria);
    create index idx_exams_byroo on exams(byroo);
    create index idx_exams_seisund on exams(seisund);
    create index idx_exams_kuupaev on exams(kuupaev);
    create index idx_exams_eksamineerija on exams(eksamineerija);
    create index idx_exams_viimane_autokool on exams(viimane_autokool);
  `);

  const insertStatement = sqlite.prepare(`
    insert into exams (
      eksami_sooritaja,
      kuupaev,
      byroo,
      kategooria,
      eritingimused,
      viimane_autokool,
      soiduopetaja_kaasas,
      eksamineerija,
      seisund,
      kestus,
      katk_pohjus,
      mittearvestatud,
      vead,
      year
    ) values (
      @eksami_sooritaja,
      @kuupaev,
      @byroo,
      @kategooria,
      @eritingimused,
      @viimane_autokool,
      @soiduopetaja_kaasas,
      @eksamineerija,
      @seisund,
      @kestus,
      @katk_pohjus,
      @mittearvestatud,
      @vead,
      @year
    )
  `);

  const importMany = sqlite.transaction((rows: ReturnType<typeof loadCsvRows>) => {
    for (const row of rows) {
      insertStatement.run(row);
    }
  });

  const csvFiles = [
    { file: path.join(projectRoot, "..", "se_2025.csv"), year: 2025 },
    { file: path.join(projectRoot, "..", "se_2026.csv"), year: 2026 },
  ];

  let totalRows = 0;

  for (const csvFile of csvFiles) {
    const rows = loadCsvRows(csvFile.file, csvFile.year);
    importMany(rows);
    totalRows += rows.length;
    console.log(`Imported ${rows.length} rows from ${path.basename(csvFile.file)}`);
  }

  const count = sqlite
    .prepare("select count(*) as count from exams")
    .get() as { count: number };

  console.log(`Database ready at ${databasePath}`);
  console.log(`Total rows: ${count.count} (expected ${totalRows})`);

  sqlite.close();
}

main();
