import { writeFileSync } from 'fs';

async function fetchText(url: string) {
  return fetch(url).then((resp) => resp.text());
}

(async () => {
  const indexHtml = await fetchText(
    'https://shakespeare-navigators.com/hamlet/SceneTextIndex.html'
  );

  const scenes = [
    ...indexHtml.matchAll(/HREF="Hamlet_Act_(\d)_Scene_(\d)\.html"/g),
  ].map(([, actNumber, sceneNumber]) => {
    return {
      actNumber: Number(actNumber),
      sceneNumber: Number(sceneNumber),
      sourceLink: `https://shakespeare-navigators.com/hamlet/Hamlet_Act_${actNumber}_Scene_${sceneNumber}.html`,
    };
  });

  for (const scene of scenes) {
    console.log(
      `Downloading Act ${scene.actNumber}, scene ${scene.sceneNumber}`
    );
    const sceneHtml = await fetchText(scene.sourceLink);

    // if (scene.actNumber === 4 && scene.sceneNumber === 2) {
    //   sceneHtml = sceneHtml.replace('(<I>Within.</I>)', '<I>(Within.)</I>');
    // }
    // if(scene.actNumber===4 && scene.sceneNumber===4){
    //   sceneHtml = sceneHtml.replace
    // }

    writeFileSync(
      `./scenes-html/A${scene.actNumber}S${scene.sceneNumber}.html`,
      sceneHtml
    );
  }

  console.log('Done');
})();
