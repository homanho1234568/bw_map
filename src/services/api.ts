import { supabase } from '../lib/supabase';
import type { Booth, Hall, DBBooth, DBFreebie, DBVenue, DBWork } from '../types';

export async function fetchHalls(): Promise<Hall[]> {
  const defaultHalls: Hall[] = [
    { id: '1.1H', name: '1.1H 館', theme: '虛擬樂園 / 模玩', color: 'pink-500', bgGrad: 'from-pink-500 to-rose-500', description: '虛擬主播、VUP 舞台與模玩特區' },
    { id: '2.1H', name: '2.1H 館', theme: '虛擬樂園 / 桌遊', color: 'pink-600', bgGrad: 'from-pink-600 to-rose-600', description: '虛擬偶像互動區與實體桌遊體驗' },
    { id: '3.1H', name: '3.1H 館', theme: '遊戲世界', color: 'blue-500', bgGrad: 'from-blue-500 to-cyan-500', description: '海內外熱門遊戲大作試玩' },
    { id: '4.1H', name: '4.1H 館', theme: '遊戲世界', color: 'blue-600', bgGrad: 'from-blue-600 to-cyan-600', description: '獨立遊戲與電競賽事舞台' },
    { id: '5.1H', name: '5.1H 館', theme: '動漫舞台', color: 'purple-500', bgGrad: 'from-purple-500 to-fuchsia-500', description: '人氣動漫作品展出與聲優見面會' },
    { id: '6.1H', name: '6.1H 館', theme: '遊戲世界', color: 'blue-700', bgGrad: 'from-blue-700 to-indigo-600', description: '綜合遊戲展區' },
    { id: '7.1H', name: '7.1H 館', theme: '創作者空間', color: 'amber-500', bgGrad: 'from-amber-500 to-orange-500', description: '百大 UP 主見面會與簽售' },
    { id: '8.1H', name: '8.1H 館', theme: '大舞台', color: 'amber-600', bgGrad: 'from-amber-600 to-orange-600', description: '主舞台活動與各類精采表演' }
  ];

  if (!supabase) return defaultHalls;
  
  const { data, error } = await supabase.from('halls').select('*');
  if (error || !data || data.length === 0) {
    // console.error('Error fetching halls:', error);
    return defaultHalls;
  }
  return data as Hall[];
}

export async function fetchBooths(): Promise<Booth[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from('booths').select('*, venues(*), freebies(*), booth_works(works(*))');
  if (error) {
    // console.error('Error fetching booths:', error);
    return [];
  }
  
  return data.map((b: any) => {
    // Extract works
    const worksList = b.booth_works?.map((bw: any) => bw.works) || [];
    const gameIps = worksList.filter((w: any) => w?.type === 'game').map((w: any) => w?.name);
    const animeIps = worksList.filter((w: any) => w?.type === 'anime').map((w: any) => w?.name);

    return {
      id: b.id.toString(),
      name: b.name,
      code: b.booth_number,
      hall: b.venues?.hall_name || '1.1H',
      category: b.venues?.zone_name || 'other',
      description: b.description || '',
      tags: [],
      game_ip: gameIps.join(', '),
      anime_ip: animeIps.join(', '),
      freebies: (b.freebies || []).map((f: any) => ({
         id: f.id.toString(),
         name: f.name,
         type: f.get_type || 'other',
         description: f.get_method || '',
         condition: f.get_method || '',
         difficulty: 'easy',
         official_link: f.link,
         image_url: f.image_url,
         is_announced: f.is_announced,
      })),
      mapX: b.map_x,
      mapY: b.map_y,
      width: 14,
      height: 14,
      featured: b.is_featured,
      status: b.status,
      official_link: b.link,
      image_url: b.image_url
    };
  }) as Booth[];
}

export async function addBooth(boothData: any, freebiesData: any[]) {
  if (!supabase) throw new Error('Supabase not configured');
  
  // 1. Get or Create Venue based on hall and category
  let venueId;
  const { data: existingVenues, error: venueSearchError } = await supabase
    .from('venues')
    .select('id')
    .eq('hall_name', boothData.hall)
    .eq('zone_name', boothData.category)
    .limit(1);

  if (venueSearchError) throw venueSearchError;

  if (existingVenues && existingVenues.length > 0) {
    venueId = existingVenues[0].id;
  } else {
    const { data: newVenue, error: newVenueError } = await supabase
      .from('venues')
      .insert([{ hall_name: boothData.hall, zone_name: boothData.category }])
      .select()
      .single();
    
    if (newVenueError) throw newVenueError;
    venueId = newVenue.id;
  }
  
  // 2. Insert booth using new schema
  const dbBoothData = {
    venue_id: venueId,
    booth_number: boothData.code,
    name: boothData.name,
    description: boothData.description,
    link: boothData.official_link,
    image_url: boothData.image_url,
    map_x: boothData.mapX,
    map_y: boothData.mapY,
    is_featured: boothData.featured || false,
    status: boothData.status !== undefined ? boothData.status : 1
  };

  const { data: booth, error: boothError } = await supabase
    .from('booths')
    .insert([dbBoothData])
    .select()
    .single();
    
  if (boothError) throw boothError;
  
  // 3. Handle works and booth_works if game_ip or anime_ip is provided
  const worksToProcess: { name: string, type: 'game' | 'anime' }[] = [];
  if (boothData.game_ip) {
    boothData.game_ip.split(',').map((ip: string) => ip.trim()).filter(Boolean).forEach((ip: string) => {
      worksToProcess.push({ name: ip, type: 'game' });
    });
  }
  if (boothData.anime_ip) {
    boothData.anime_ip.split(',').map((ip: string) => ip.trim()).filter(Boolean).forEach((ip: string) => {
      worksToProcess.push({ name: ip, type: 'anime' });
    });
  }

  for (const work of worksToProcess) {
    let workId;
    const { data: existingWork, error: workSearchError } = await supabase
      .from('works')
      .select('id')
      .eq('name', work.name)
      .limit(1);

    if (existingWork && existingWork.length > 0) {
      workId = existingWork[0].id;
    } else {
      const { data: newWork, error: newWorkError } = await supabase
        .from('works')
        .insert([{ name: work.name, type: work.type }])
        .select()
        .single();
      if (!newWorkError && newWork) {
        workId = newWork.id;
      }
    }

    if (workId) {
      await supabase
        .from('booth_works')
        .insert([{ booth_id: booth.id, work_id: workId }]);
    }
  }

  // 4. Insert freebies using new schema
  if (freebiesData && freebiesData.length > 0) {
    const dbFreebiesData = freebiesData.map(f => ({
      booth_id: booth.id,
      name: f.name,
      get_method: f.condition || f.description,
      get_type: f.type,
      link: f.official_link,
      image_url: f.image_url,
      is_announced: f.is_announced !== undefined ? f.is_announced : true
    }));
    
    const { error: freebiesError } = await supabase
      .from('freebies')
      .insert(dbFreebiesData);
      
    if (freebiesError) throw freebiesError;
  }
  
  return booth;
}

export async function updateBooth(boothId: string, boothData: any, freebiesData: any[]) {
  if (!supabase) throw new Error('Supabase not configured');

  // 1. Get or Create Venue based on hall and category
  let venueId;
  const { data: existingVenues, error: venueSearchError } = await supabase
    .from('venues')
    .select('id')
    .eq('hall_name', boothData.hall)
    .eq('zone_name', boothData.category)
    .limit(1);

  if (venueSearchError) throw venueSearchError;

  if (existingVenues && existingVenues.length > 0) {
    venueId = existingVenues[0].id;
  } else {
    const { data: newVenue, error: newVenueError } = await supabase
      .from('venues')
      .insert([{ hall_name: boothData.hall, zone_name: boothData.category }])
      .select()
      .single();
    
    if (newVenueError) throw newVenueError;
    venueId = newVenue.id;
  }
  
  // 2. Update booth
  const dbBoothData = {
    venue_id: venueId,
    booth_number: boothData.code,
    name: boothData.name,
    description: boothData.description,
    link: boothData.official_link,
    image_url: boothData.image_url,
    map_x: boothData.mapX,
    map_y: boothData.mapY,
    is_featured: boothData.featured || false,
    status: boothData.status !== undefined ? boothData.status : 1
  };

  const { error: boothError } = await supabase
    .from('booths')
    .update(dbBoothData)
    .eq('id', boothId);
    
  if (boothError) throw boothError;
  
  // 3. Update booth_works
  // First, delete existing
  await supabase.from('booth_works').delete().eq('booth_id', boothId);
  
  const worksToProcess: { name: string, type: 'game' | 'anime' }[] = [];
  if (boothData.game_ip) {
    boothData.game_ip.split(',').map((ip: string) => ip.trim()).filter(Boolean).forEach((ip: string) => {
      worksToProcess.push({ name: ip, type: 'game' });
    });
  }
  if (boothData.anime_ip) {
    boothData.anime_ip.split(',').map((ip: string) => ip.trim()).filter(Boolean).forEach((ip: string) => {
      worksToProcess.push({ name: ip, type: 'anime' });
    });
  }

  for (const work of worksToProcess) {
    let workId;
    const { data: existingWork } = await supabase
      .from('works')
      .select('id')
      .eq('name', work.name)
      .limit(1);

    if (existingWork && existingWork.length > 0) {
      workId = existingWork[0].id;
    } else {
      const { data: newWork, error: newWorkError } = await supabase
        .from('works')
        .insert([{ name: work.name, type: work.type }])
        .select()
        .single();
      if (!newWorkError && newWork) {
        workId = newWork.id;
      }
    }

    if (workId) {
      await supabase
        .from('booth_works')
        .insert([{ booth_id: boothId, work_id: workId }]);
    }
  }

  // 4. Update freebies
  // First delete existing freebies
  await supabase.from('freebies').delete().eq('booth_id', boothId);

  if (freebiesData && freebiesData.length > 0) {
    const dbFreebiesData = freebiesData.map(f => ({
      booth_id: boothId,
      name: f.name,
      get_method: f.condition || f.description,
      get_type: f.type,
      link: f.official_link,
      image_url: f.image_url,
      is_announced: f.is_announced !== undefined ? f.is_announced : true
    }));
    
    const { error: freebiesError } = await supabase
      .from('freebies')
      .insert(dbFreebiesData);
      
    if (freebiesError) throw freebiesError;
  }
  
  return { success: true };
}

export async function deleteBooth(boothId: string) {
  if (!supabase) throw new Error('Supabase not configured');
  // First delete related freebies and works mapping to prevent constraint errors
  await supabase.from('freebies').delete().eq('booth_id', boothId);
  await supabase.from('booth_works').delete().eq('booth_id', boothId);
  
  const { error } = await supabase
    .from('booths')
    .delete()
    .eq('id', boothId);
    
  if (error) throw error;
  return { success: true };
}
