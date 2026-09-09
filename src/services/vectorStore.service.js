import supabase from '../config/supabase.js';

export async function createCompany(name) {
  const { data, error } = await supabase.from('companies').insert([{ name }]).select();
  if (error) throw error;
  return data[0];
}

export async function addKnowledgeEntry(company_id, content, embedding) {
  const { data, error } = await supabase
    .from('knowledge_base')
    .insert([{ company_id, content, embedding }])
    .select('id, company_id, content, created_at');
  if (error) throw error;
  return data[0];
}

export async function matchKnowledge(queryEmbedding, company_id) {
  const { data: matchedDocs, error: dbError } = await supabase.rpc('match_knowledge', {
    query_embedding: queryEmbedding,
    match_threshold: 0.3,
    match_count: 5,
    filter_company_id: company_id,
  });

  if (dbError) throw dbError;
  return matchedDocs;
}
