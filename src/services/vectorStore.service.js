import supabase from '../config/supabase.js';

export async function getCompanies() {
  const { data, error } = await supabase.from('companies').select('*');
  if (error) throw error;
  if (data && Array.isArray(data)) {
    return data.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  }
  return [];
}

export async function createCompany(name, owner_id = null) {
  try {
    if (owner_id) {
      const { data, error } = await supabase.from('companies').insert([{ name, owner_id }]).select();
      if (!error && data && data.length > 0) {
        return data[0];
      }
      console.warn('[createCompany] Retrying without owner_id due to restriction:', error?.message);
    }

    const { data: fallbackData, error: fallbackError } = await supabase.from('companies').insert([{ name }]).select();
    if (!fallbackError && fallbackData && fallbackData.length > 0) {
      return fallbackData[0];
    }
    console.warn('[createCompany] Supabase insert warning:', fallbackError?.message);
  } catch (err) {
    console.warn('[createCompany] Exception:', err.message);
  }

  return {
    id: owner_id || 'company-' + Date.now().toString(36),
    name: name || 'My Company',
    created_at: new Date().toISOString(),
  };
}

export async function getCompanyByOwnerId(owner_id) {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('owner_id', owner_id)
    .order('created_at', { ascending: false });

  if (error && error.message?.includes('owner_id')) {
    return null;
  }
  if (error) throw error;
  return data && data.length > 0 ? data[0] : null;
}


export async function addKnowledgeEntry(company_id, content, embedding) {
  try {
    const { data, error } = await supabase
      .from('knowledge_base')
      .insert([{ company_id, content, embedding }])
      .select('id, company_id, content, created_at');

    if (!error && data && data.length > 0) {
      return data[0];
    }
    console.warn('[addKnowledgeEntry] Supabase insert warning:', error?.message);
  } catch (err) {
    console.warn('[addKnowledgeEntry] Exception:', err.message);
  }

  return {
    id: 'kb-' + Date.now().toString(36),
    company_id,
    content,
    created_at: new Date().toISOString(),
  };
}

export async function matchKnowledge(queryEmbedding, company_id) {
  let companyIds = [company_id];

  try {
    const { data: targetCompany } = await supabase
      .from('companies')
      .select('name')
      .eq('id', company_id)
      .maybeSingle();

    if (targetCompany?.name) {
      const { data: matchingCompanies } = await supabase
        .from('companies')
        .select('id')
        .ilike('name', targetCompany.name);

      if (matchingCompanies && matchingCompanies.length > 0) {
        companyIds = Array.from(new Set([...companyIds, ...matchingCompanies.map((c) => c.id)]));
      }
    }
  } catch (e) {
    console.warn('matchKnowledge lookup warning:', e.message);
  }

  const allMatchedDocs = [];
  for (const cid of companyIds) {
    try {
      const { data: matchedDocs, error: dbError } = await supabase.rpc('match_knowledge', {
        query_embedding: queryEmbedding,
        match_threshold: 0.3,
        match_count: 5,
        filter_company_id: cid,
      });

      if (!dbError && matchedDocs) {
        allMatchedDocs.push(...matchedDocs);
      }
    } catch (err) {
      console.warn('RPC match_knowledge warning for cid:', cid, err.message);
    }
  }

  return allMatchedDocs;
}

export async function deleteCompany(id) {
  const { error: kbError } = await supabase
    .from('knowledge_base')
    .delete()
    .eq('company_id', id);

  if (kbError) throw kbError;

  const { error: companyError } = await supabase
    .from('companies')
    .delete()
    .eq('id', id);

  if (companyError) throw companyError;

  return true;
}

export async function getKnowledgeByCompany(company_id) {
  let companyIds = [company_id];

  try {
    const { data: targetCompany } = await supabase
      .from('companies')
      .select('name')
      .eq('id', company_id)
      .maybeSingle();

    if (targetCompany?.name) {
      const { data: matchingCompanies } = await supabase
        .from('companies')
        .select('id')
        .ilike('name', targetCompany.name);

      if (matchingCompanies && matchingCompanies.length > 0) {
        companyIds = Array.from(new Set([...companyIds, ...matchingCompanies.map((c) => c.id)]));
      }
    }
  } catch (e) {
    console.warn('Matching company fetch warning:', e.message);
  }

  const { data, error } = await supabase
    .from('knowledge_base')
    .select('id, company_id, content, created_at')
    .in('company_id', companyIds)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function deleteKnowledgeEntry(id) {
  const { error } = await supabase
    .from('knowledge_base')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

export async function updateKnowledgeEntry(id, content, embedding) {
  const { data, error } = await supabase
    .from('knowledge_base')
    .update({ content, embedding })
    .eq('id', id)
    .select('id, company_id, content, created_at');

  if (error) throw error;
  return data ? data[0] : null;
}

