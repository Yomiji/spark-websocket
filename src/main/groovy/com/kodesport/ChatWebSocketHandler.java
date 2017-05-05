package com.kodesport;

import org.eclipse.jetty.websocket.api.*;
import org.eclipse.jetty.websocket.api.annotations.*;

import java.io.IOException;
import java.io.InputStream;
import java.util.Arrays;
import java.util.Date;

@WebSocket
public class ChatWebSocketHandler {

    private String sender;
    private ChatMessage.Message msg;

    @OnWebSocketConnect
    public void onConnect(Session user) throws Exception {
        String username = "User" + Chat.nextUserNumber++;
        Chat.userUsernameMap.put(user, username);
        Chat.broadcastMessage(msg = ChatMessage.Message.newBuilder()
                .setMsg(username + " joined the chat")
                .setTimestamp(Long.toString(new Date().getTime() / 1000))
                .setUser("Server")
                .addAllUserlist(Chat.userUsernameMap.values())
        .build());
    }

    @OnWebSocketClose
    public void onClose(Session user, int statusCode, String reason) {
        String username = Chat.userUsernameMap.get(user);
        Chat.userUsernameMap.remove(user);
        Chat.broadcastMessage(msg = ChatMessage.Message.newBuilder()
                .setMsg(username + " has left the chat")
                .setTimestamp(Long.toString(new Date().getTime() / 1000))
                .setUser("Server")
                .addAllUserlist(Chat.userUsernameMap.values())
        .build());
    }

    @OnWebSocketMessage
    public void onMessage(Session user, byte[] buffer, int offset, int length) {
        try {
            Chat.broadcastMessage(msg = ChatMessage.Message.newBuilder(ChatMessage.Message.parseFrom(buffer))
                    .setUser(Chat.userUsernameMap.get(user)).build());
        } catch(IOException ioex) {
            Chat.broadcastMessage(msg = ChatMessage.Message.newBuilder().build());
        }
    }
}
