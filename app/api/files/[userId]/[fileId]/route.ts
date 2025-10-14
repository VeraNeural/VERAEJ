import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { unlink } from 'fs/promises';
import { join } from 'path';

// DELETE /api/files/:userId/:fileId - Delete file
export async function DELETE(
  request: NextRequest,
  { params }: { params: { userId: string; fileId: string } }
) {
  try {
    const { userId, fileId } = params;

    // Get file info
    const fileResult = await query(
      'SELECT * FROM files WHERE id = $1 AND user_id = $2',
      [fileId, userId]
    );

    if (fileResult.rows.length === 0) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const file = fileResult.rows[0];

    // Delete from filesystem
    const filePath = join(process.cwd(), 'public', file.url);
    try {
      await unlink(filePath);
    } catch (error) {
      console.error('Failed to delete file from filesystem:', error);
    }

    // Delete from database
    await query('DELETE FROM files WHERE id = $1', [fileId]);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Failed to delete file:', error);
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
  }
}