import type { buildBuffData } from "../embeds/buffs.js";


type BuffData = {
    buff_type: string,
    buff_faction:'both' | 'alliance' | 'horde',
    buff_date: string,
    buff_notes: string,
    buff_guild: string,
    badge: boolean
}

async function getWhenBuffsData() {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const formattedDate = `${day}/${month}/${year}`
    const url = `https://api.whenbuff.com/buffs?server=Doomhowl&from_date=${formattedDate}&to_date=${formattedDate}`;
    try {
        const response = await fetch(url)
        return response.json();
    } catch (error) {
        console.log('token error')
        return null
    }
}

export async function getBuffData() {
    const data = await getWhenBuffsData() as BuffData[]
    if (data) {
        const filtered=  data.filter(element =>element.buff_faction !== 'horde')
        const trimmedData : buildBuffData[] = filtered.map(buff =>({
            type: buff.buff_type,
            date: buff.buff_date
        }));
        return trimmedData
    } else {
        return null;
    }
    
}

export function convertTime(buff_date: string): number {
  const parts = buff_date.split('-');
  if (parts.length !== 2) throw new Error('Invalid date format');
  
  const [date, time] = parts;
  const dateParts = date!.split('/');
  if (dateParts.length !== 3) throw new Error('Invalid date format');
  
  const [day, month, year] = dateParts;
  const timeParts = time!.split(':');
  if (timeParts.length !== 2) throw new Error('Invalid time format');
  
  const [hours, minutes] = timeParts;
  const utcDate = Date.UTC(
    parseInt(year!),
    parseInt(month!) - 1, 
    parseInt(day!),
    parseInt(hours!),
    parseInt(minutes!)
  );
  const mstToUtcTimestamp = Math.floor(utcDate / 1000) + (7 * 3600);
  const pstTimestamp = mstToUtcTimestamp - 3600;
  return pstTimestamp;
}


