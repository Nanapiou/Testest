import {ANNONCE_ID, ARCHIVE_ID, CALLED_ID} from "./config.js";
import {Client} from "pioucord";
import {createServer} from "http";

const client = new Client({
    intents: [
        "GuildMessages",
        "GuildMessageReactions",
        "MessageContent"
    ]
});

client.ws.on("READY", data => {
    console.log(`Logged in as ${data.user.username}`);
});

client.ws.on("MESSAGE_CREATE", async msg => {
    const linkRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/
    if (msg.channel_id === ANNONCE_ID && linkRegex.test(msg.content)) {
        await client.rest.put(`/channels/${ANNONCE_ID}/messages/${msg.id}/reactions/✅/@me`);
        await client.rest.put(`/channels/${ANNONCE_ID}/messages/${msg.id}/reactions/❎/@me`);
    }
});

client.ws.on("MESSAGE_REACTION_ADD", async data => {
    if (data.user_id !== client.user.id) {
        if (data.emoji.name === "✅" && data.channel_id === ANNONCE_ID) {
            const msg = await client.rest.get(`/channels/${ANNONCE_ID}/messages/${data.message_id}`);
            const sent = await client.rest.post(`/channels/${ARCHIVE_ID}/messages`, {
                content: msg.content
            });
            await client.rest.put(`/channels/${ARCHIVE_ID}/messages/${sent.id}/reactions/📳/@me`);
        } else if (data.emoji.name === "📳" && data.channel_id === ARCHIVE_ID) {
            const msg = await client.rest.get(`/channels/${ARCHIVE_ID}/messages/${data.message_id}`);
            await client.rest.post(`/channels/${CALLED_ID}/messages`, {
                content: msg.content
            });
        }
    }
});

await client.login(process.env.TOKEN);

const port = process.env.PORT || 3000;
const server = createServer((req, res) => {});
server.listen(port);
