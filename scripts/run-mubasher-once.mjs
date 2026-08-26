const { runMubasherCollector } = await import('../server/efgCollector.ts');
console.log(JSON.stringify(await runMubasherCollector(), null, 2));
