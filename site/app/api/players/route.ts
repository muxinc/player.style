import { getCollection } from '../../_utils/content';
const themes = await getCollection('players');

export async function GET(request: Request) {
  return Response.json({ themes })
}
