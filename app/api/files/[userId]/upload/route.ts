import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { writeFile } from 'fs/promises';
import { join } from 'path';

// POST /api/files/:userId/upload - Upload files
export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    const uploadedFiles = [];

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Save to public/uploads directory
      const fileName = `${Date.now()}-${file.name}`;
      const path = join(process.cwd(), 'public', 'uploads', fileName);
      await writeFile(path, buffer);

      const url = `/uploads/${fileName}`;

      // Save to database
      const result = await query(
        `INSERT INTO files (user_id, name, size, type, uploaded_at, url)
         VALUES ($1, $2, $3, $4, NOW(), $5)
         RETURNING *`,
        [userId, file.name, file.size, file.type, url]
      );

      uploadedFiles.push(result.rows[0]);
    }

    return NextResponse.json(uploadedFiles, { status: 201 });
  } catch (error) {
    console.error('Failed to upload files:', error);
    return NextResponse.json({ error: 'Failed to upload files' }, { status: 500 });
  }
}