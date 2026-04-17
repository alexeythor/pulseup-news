import { NextRequest } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

export const dynamic = 'force-dynamic';

const DB_PATH = path.join(process.cwd(), 'data', 'events.db');

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const db = new Database(DB_PATH, { readonly: true });

    const digest = db.prepare(`
      SELECT * FROM digests WHERE slug = ? AND is_active = 1
    `).get(slug);

    if (!digest) {
      db.close();
      return Response.json({ error: 'Digest not found' }, { status: 404 });
    }

    const events = db.prepare(`
      SELECT e.*, de.curator_note, de.sort_order
      FROM digest_events de
      JOIN events e ON e.id = de.event_id
      WHERE de.digest_id = ?
      ORDER BY de.sort_order ASC
    `).all((digest as { id: number }).id);

    db.close();
    return Response.json({ digest, events });
  } catch (err) {
    console.error('Digest detail API error:', err);
    return Response.json({ error: 'Failed to fetch digest' }, { status: 500 });
  }
}
