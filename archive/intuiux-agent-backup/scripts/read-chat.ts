import ZAI from 'z-ai-web-dev-sdk';

async function readChat() {
  try {
    console.log('Creating ZAI instance...');
    const zai = await ZAI.create();
    
    console.log('Reading page...');
    const result = await zai.functions.invoke('page_reader', {
      url: 'https://chat.deepseek.com/share/q1vnc46hsbq18q8hjl'
    });
    
    console.log('Title:', result.data?.title);
    console.log('URL:', result.data?.url);
    console.log('---CONTENT---');
    console.log(result.data?.html?.substring(0, 50000));
    console.log('---END---');
    
  } catch (error: any) {
    console.error('Error:', error.message);
    console.error('Full error:', JSON.stringify(error, null, 2));
  }
  
  process.exit(0);
}

readChat();
