package org.atmosphere.samples.chat.angular;

import org.atmosphere.config.managed.Decoder;
import org.atmosphere.config.managed.Encoder;
import org.codehaus.jackson.map.ObjectMapper;

import java.io.IOException;

public final class ChatMessageEncoderDecoder implements Encoder<ChatMessage, String>, Decoder<String, ChatMessage>{
    private final ObjectMapper mapper = new ObjectMapper();

    @Override
    public ChatMessage decode(final String s){
        try{
            return mapper.readValue(s, ChatMessage.class);
        }catch(IOException e){
            throw new RuntimeException(e);
        }
    }

    @Override
    public String encode(final ChatMessage message){
        try{
            return mapper.writeValueAsString(message);
        }catch(IOException e){
            throw new RuntimeException(e);
        }
    }
}
