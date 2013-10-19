package org.atmosphere.samples.chat.angular;

import org.atmosphere.config.managed.Decoder;
import org.atmosphere.config.managed.Encoder;
import org.codehaus.jackson.map.ObjectMapper;

import java.io.IOException;

public final class MessageEncoderDecoder implements Encoder<Message, String>, Decoder<String, Message>{
  private final ObjectMapper mapper = new ObjectMapper();

  @Override
  public Message decode(final String s){
    try{
      return mapper.readValue(s, Message.class);
    }catch(IOException e){
      throw new RuntimeException(e);
    }
  }

  @Override
  public String encode(final Message message){
    try{
      return mapper.writeValueAsString(message);
    }catch(IOException e){
      throw new RuntimeException(e);
    }
  }
}
