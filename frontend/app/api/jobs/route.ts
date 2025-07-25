import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { createSupabaseServerClient } from '@/app/utils/server';

export async function POST(request: Request) {
  try {
    // const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const video = formData.get('video') as File;
    const face = formData.get('face') as File;
    const videoUrl = formData.get('videoUrl') as string;
    const faceUrl = formData.get('faceUrl') as string;

    if (!video || !face || !videoUrl || !faceUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const job = await prisma.job.create({
      data: {
        userId: user.id,
        status: 'queued',
        videoName: video.name,
        faceName: face.name,
        videoUrl: videoUrl,
        faceUrl: faceUrl
      }
    });

    // Here you would typically handle the file upload and processing
    // For now, we'll just return the created job
    return NextResponse.json(job);
  } catch (error) {
    console.error('Error creating job:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('id');

    if (jobId) {
      const job = await prisma.job.findUnique({
        where: { id: jobId }
      });

      if (!job) {
        return NextResponse.json({ error: 'Job not found' }, { status: 404 });
      }

      return NextResponse.json(job);
    }

    const jobs = await prisma.job.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 