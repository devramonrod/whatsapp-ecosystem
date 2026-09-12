package com.whatsapp.ai.agent.application;

import com.whatsapp.ai.agent.infrastructure.messaging.AgentMessageProducer;
import com.whatsapp.ai.agent.infrastructure.rest.ConfigManagerClient;
import dev.langchain4j.agent.tool.Tool;

import java.util.Map;

public class LeadQualificationTool {

    private final String instanceName;
    private final String remoteJid;
    private final ConfigManagerClient configManagerClient;
    private final AgentMessageProducer messageProducer;

    public LeadQualificationTool(String instanceName, String remoteJid, ConfigManagerClient configManagerClient, AgentMessageProducer messageProducer) {
        this.instanceName = instanceName;
        this.remoteJid = remoteJid;
        this.configManagerClient = configManagerClient;
        this.messageProducer = messageProducer;
    }

    @Tool("Qualifica o lead com as informações coletadas, desativa a IA para este chat e notifica os donos. Use esta ferramenta APENAS quando tiver todas as informações do lead.")
    public String qualificar_lead(String nome, String interesse, String telefone, String resumo) {
        System.out.println("Lead qualificado! Nome: " + nome + ", Interesse: " + interesse);

        // 1. Pausar IA para este lead
        try {
            configManagerClient.toggleAiStatus(instanceName, remoteJid, Map.of("aiActive", false));
        } catch (Exception e) {
            System.err.println("Erro ao pausar IA: " + e.getMessage());
        }

        // 2. Enviar notificação
        try {
            var config = configManagerClient.getByPhoneNumber(instanceName);
            if (config != null && config.notificationNumbers != null && !config.notificationNumbers.trim().isEmpty()) {
                String notificationMessage = String.format(
                        "🔥 *NOVO LEAD QUALIFICADO* 🔥\n\n" +
                        "👤 *Cliente:* %s\n" +
                        "🎯 *Interesse:* %s\n" +
                        "📱 *Telefone:* %s\n" +
                        "📝 *Resumo:* %s\n\n" +
                        "_IA pausada para este contato._", 
                        nome, interesse, telefone, resumo);

                String[] numbers = config.notificationNumbers.split(",");
                for (String number : numbers) {
                    number = number.trim();
                    if (!number.isEmpty()) {
                        // Ensure it has the correct WhatsApp format (without @s.whatsapp.net as the gateway will append or use it)
                        String targetJid = number + "@s.whatsapp.net";
                        messageProducer.sendReply(instanceName, targetJid, notificationMessage);
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Erro ao enviar notificação de lead: " + e.getMessage());
        }

        return "Lead qualificado com sucesso. O atendimento será continuado por um humano.";
    }
}

