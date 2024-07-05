import { getCollection } from '../../_utils/content';
const themes = await getCollection('themes');

export async function GET(request: Request) {
  return Response.json({ themes })
}
