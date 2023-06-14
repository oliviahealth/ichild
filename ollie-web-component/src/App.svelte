<svelte:options tag="my-card" />
<script>
	async function sendUserQuery(query) {

        const queryResponse = await fetch('', {
            method: "POST",
            body: new URLSearchParams({ "data": query })
        }).catch((err) => {
            sendMessage("Sorry, I am unable to connect to a network. Please check your internet connection.")
            throw new Error(`Ollie Chatbox Error: ${err}`)
        });

        const queryData = await queryResponse.json(); 
        const foundData = queryData.confidences.reduce((acc, curr, index)=> {
            if (curr > 0.3){
                acc.push({ 
                    confidence: curr, 
                    name: queryData.names[index].replace( /(<([^>]+)>)/ig, ''),   // sanitizing api responses in-case db gets compromised
                    description: queryData.descriptions[index].replace( /(<([^>]+)>)/ig, ''),
                    address: queryData.address[index * 2 + 1].replace( /(<([^>]+)>)/ig, ''),
                    encodedAddress: queryData.address[index * 2].replace( /(<([^>]+)>)/ig, ''),
                    phone: queryData.phone[index].replace( /(<([^>]+)>)/ig, ''),
                })
            }
            return acc;
        }, []).sort((a, b) => a.confidence - b.confidence);
        if (foundData.length) {
            sendMessage(["<p>I've found " + 
                         foundData.length + 
                        (foundData.length > 1 ? " possible matches for you," : " possible match for you, "), 
                        " Hover over a facility name for a description</p><br/>",
                      ...foundData.map((d, i) => 
                      `<p><b>${i + 1}. <a title="${d.description}" style="color:white;text-decoration:none;">${d.name}</a></b></p>
                       <a href="tel:${d.phone.replace(/\(|\)|-/g, '')}" style="color:white;"><div style="display: flex; align-items: center; gap: 5px;"><svg viewBox="0 0 512 512" width="10px" height="10px" stroke="currentColor" fill="currentColor" stroke-width="0" ><path d="M497.39 361.8l-112-48a24 24 0 0 0-28 6.9l-49.6 60.6A370.66 370.66 0 0 1 130.6 204.11l60.6-49.6a23.94 23.94 0 0 0 6.9-28l-48-112A24.16 24.16 0 0 0 122.6.61l-104 24A24 24 0 0 0 0 48c0 256.5 207.9 464 464 464a24 24 0 0 0 23.4-18.6l24-104a24.29 24.29 0 0 0-14.01-27.6z" /></svg><p><small>${d.phone}</small></p></div></a>
                       <a target="_blank" href="${d.encodedAddress}" style="color:white;"><div style="display: flex; align-items: center; gap: 5px;"><svg viewBox="0 0 512 512" width="10px" height="10px" stroke="currentColor" fill="currentColor" stroke-width="0"><path d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z" /></svg><p><small>${d.address}</small></p></div></a>
                       ${i != foundData.length - 1 ? "<br/>" : ""}`)]
                      .join(""))
        } else {
            sendMessage(queryData.notFoundMessage ?? queryData.winnername);
        }
	}
    function sendMessage(msg) {
		loadingMsg = true;
		setTimeout(() => {
            messageState = [...messageState, { msg: `<p>${msg}</p>`, ollie: true }];
			loadingMsg = false;
		}, 750);
	}
	let numBtnPresses = 0;
	let textRows = 1;
	let messageState = [];
	let loadingMsg = false;
</script>
    <div id="chatBox" class="fixed-position show">
        <div id="chatBox-header"><p>Ollie</p></div>
        <div id="chatBox-content">
            {#if loadingMsg}
                <div id="loading-msg">Ollie is typing...</div>
            {/if}
            {#each [...messageState].reverse() as msg}
                <div id="message" class={msg.ollie ? "msg-left" : "msg-right"}>
                    <img
                        id="avatar"
                        src={msg.ollie ? "http://oliviahealth.org/wp-content/uploads/2023/03/olliehead.png" : "http://oliviahealth.org/wp-content/uploads/2023/01/white-thick-logo.png"}
                        alt="avatar"
                        class={msg.ollie ? "" : "my-avatar"}
                    />
                    {#if msg.ollie}
                        <div id="message-text">{@html msg.msg}</div>
                        {:else}
                        <div id="message-text">{msg.msg}</div>
                    {/if}
                </div>
            {/each}
        </div>
        <div id="chatBox-message">
            <textarea
                id="chatbox-textarea"
                rows={Math.min(textRows, 4)}
                placeholder="Type message..."
                on:keydown={(e) => {
                    const text = e.target?.value;
                    if (text) {
                        textRows = Math.ceil(text.length / 20);
                        if (e.keyCode === 13 && !e.shiftKey) {
                            e.preventDefault();
                                messageState = [...messageState, {msg: text, ollie: false}];
                                sendUserQuery(text);
                                textRows = 1;
                                e.target.value = "";
                        }
                    }
                }}
          
            />
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <div class="send-button" on:click={()=> {
                const element = document.querySelector("my-card").shadowRoot;
                const textarea = element.querySelector("textarea");
                const text = textarea?.value;
                if (text) {
                    messageState = [
                        ...messageState,
                            {msg: text, ollie: false},
                        ];
                    sendUserQuery(text);
                    textarea.value = "";
                    textRows = 1;
                }
                }}>
                    <svg viewBox="0 0 512 512" stroke="currentColor" fill="currentColor" stroke-width="0"  width="100%" max-height="100%">
                        <path d="M48 448l416-192L48 64v149.333L346 256 48 298.667z" />
                    </svg>
            </div>
        </div>
    </div>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div>
        <img
            id="button"
            class="fixed-position clicked"
            on:click={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const element = document.querySelector("my-card").shadowRoot;
                const chatbox = element.getElementById("chatBox");
                const ollieBtn = element.getElementById("button");
                const txtarea = element.getElementById("chatbox-textarea");
                ollieBtn.classList.toggle("clicked");
                chatbox.classList.toggle("show");
                txtarea.focus();
                if (numBtnPresses === 0) {
                    sendMessage(
                        "<p>Hi! I'm Ollie, your virtual assistant for the OliviaHealth network. How can I help you?</p>"
                    );
					numBtnPresses = numBtnPresses + 1;
				}
					
            }}
            src={"http://oliviahealth.org/wp-content/uploads/2023/03/olliehead.png"}
            alt="Chat Button"
        />
    </div>
<style>
    img {
        width: 100vw;
    }
    .send-button {
        color: white;
        height: 25px;
        width: 25px;
    }
    .send-button:hover {
        color: whitesmoke;
        cursor: pointer;
    }

    #loading-msg {
        padding: 5px 10px 5px 10px;
        font-size: 12px;
        color: lightgray;
        font-family: "Comic Sans MS";
    }

    .fixed-position {
        position: fixed;
        bottom: 20px;
        right: 20px;
    }

    #avatar {
        width: 35px;
        height: 35px;
    }

    .my-avatar {
        background-color: #3b3a70;
        width: 35px;
        min-width: 35px;
        border-radius: 50%;
        object-fit: contain;
    }
    .msg-right {
        flex-direction: row-reverse;
        align-self: end;
    }
    .msg-left {
        align-self: start;
    }

    .msg-right > div {
        background: #d3d3d3;
        color: black;
    }
    .msg-left > div {
        background: #5b59d3;
        color: white;
    }

    #message-text {
        font-family: "Comic Sans MS";
        font-size: 16px;
        margin: 0;
        padding: 8px;
        border-radius: 6px;
    }
  
     p {
        font-size: small;
        margin: 0px;
        padding: 0px;
    }

    #message {
        max-width: 80%;
        display: flex;
        align-items: end;
        gap: 8px;
        padding: 16px 8px;

    }
    #chatBox {
        z-index: 9999;
        overflow: hidden;
        height: 70%;
        width: 400px;
        border-radius: 16px;
        transition: transform 200ms;
        position: fixed;
        bottom: 90px;
        right: 90px;
        transform-origin: bottom right;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        box-shadow: 8px 8px 32px rgba(1, 1, 1, 0.5);
    }

    #chatBox-header {
        position: relative;
        color: #9593ff;
        font-family: "Comic Sans MS";
        font-weight: 600;
        font-size: 24px;
        padding: 8px;
        background-color: rgb(255, 255, 255);
        border-top-right-radius: inherit;
        border-top-left-radius: inherit;
        box-shadow: 0px 1.6px 3.2px 0px rgba(1, 1, 1, 0.2);
    }
    #chatBox-header > p {
        padding: 0;
        font-size: 24px;
        margin: 0 0 0 10px;
    }

    #chatBox-content {
        display: flex;
        flex-direction: column-reverse;
        overflow-y: auto;
        overflow-x: hidden;
        word-wrap: anywhere;
    }
    #chatBox-message {
        display: flex;
        justify-content: space-around;
        padding: 8px 0px 8px 8px;
        background: #9593f8;
        border-bottom-right-radius: inherit;
        border-bottom-left-radius: inherit;
    }
    #chatBox-message > textarea {
        font-family: 'Comic Sans MS';
        border-radius: 16px;
        padding: 2px 10px 0px 10px;
        width: 70%;
        background: white;
        outline: none;
        border: none;
        resize: none;
        scrollbar-width: none;
        box-shadow: 1.6px -1.6px 3.2px 0px rgba(1, 1, 1, 0.2);
    }

    #chatBox-content {
        background-color: rgb(246, 246, 246);
        flex: 1;
    }

    .show {
        transform: translate(120px, 175px) scale(0);
    }
    #button {
        z-index: 10;
        aspect-ratio: 1 / 1;
        width: 70px;
        color: black;
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0px 0px 5px #3b3a70;
        transition: transform 400ms;
    }

    .clicked {
        transform: rotate(360deg);
        fill: black;
    }

    @media (max-width:480px) {
        #chatBox {
            overflow: hidden;
            width: 80%;
            border-radius: 16px;
            transition: transform 200ms;
            position: fixed;
            right: 40px;
            transform-origin: bottom right;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            box-shadow: 8px 8px 32px rgba(1, 1, 1, 0.5);
        }
    }

</style>
