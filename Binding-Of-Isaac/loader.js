 async function init() {
        async function mergeParts(base, count) {
          let requests = [];

          for (let i = 1; i <= count; i++) {
            requests.push(
              fetch(base + ".part" + i).then(async (r) => {
                if (!r.ok)
                  throw new Error("Missing part: " + base + ".part" + i);
                return await r.arrayBuffer();
              }),
            );
          }

          const buffers = await Promise.all(requests);
          return URL.createObjectURL(new Blob(buffers));
        }

        const swfUrl = await mergeParts("tboiwotl-v1.666.swf", 3);

        window.RufflePlayer = window.RufflePlayer || {};
        const ruffle = window.RufflePlayer.newest();
        const player = ruffle.createPlayer();

        const container = document.getElementById("ruffle");
        player.style.width = "100%";
        player.style.height = "100%";
        container.appendChild(player);

        player.load(swfUrl);
      }

      window.addEventListener("load", init);