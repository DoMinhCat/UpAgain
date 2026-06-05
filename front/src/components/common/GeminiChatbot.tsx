import { useState, useRef, useEffect } from "react";
import {
  Affix,
  Button,
  Modal,
  TextInput,
  ScrollArea,
  Group,
  Stack,
  Text,
  Paper,
  ActionIcon,
  Loader,
  Box,
} from "@mantine/core";
import { IconSparkles, IconSend } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { sendChatbotMessage } from "../../api/aiModule";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
}

export default function GeminiChatbot() {
  const { t } = useTranslation(["common"]);
  const [opened, setOpened] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState<Message[]>([]);

  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([
      {
        id: "welcome",
        text: t("common:chatbot.intro", {
          defaultValue:
            "Hello! I am your Upcycling Assistant. Ask me for DIY ideas, recycling tips, or details about the platform!",
        }),
        sender: "bot",
      },
    ]);
  }, [t]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTo({
        top: viewportRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userText = input;
    setInput("");

    // Append user message
    const userMsgId = Date.now().toString();
    setMessages((prev) => [
      ...prev,
      { id: userMsgId, text: userText, sender: "user" },
    ]);

    setLoading(true);

    try {
      const botResponse = await sendChatbotMessage(userText);
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), text: botResponse, sender: "bot" },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: t("common:chatbot.error_message", {
            defaultValue:
              "Sorry, I encountered an issue. Please try again later.",
          }),
          sender: "bot",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!opened && (
        <Affix position={{ bottom: 20, right: 20 }} zIndex={9999}>
          <Button
            onClick={() => setOpened(true)}
            leftSection={<IconSparkles size={20} />}
            radius="xl"
            size="lg"
            color="var(--upagain-neutral-green, #5a9e6f)"
            style={{
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
              e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
            }}
          >
            {t("common:chatbot.button_label", { defaultValue: "Ask Arnaud" })}
          </Button>
        </Affix>
      )}

      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title={
          <Group gap="xs">
            <IconSparkles
              size={22}
              color="var(--upagain-neutral-green, #5a9e6f)"
            />
            <Text fw={700} size="lg">
              {t("common:chatbot.title", {
                defaultValue: "Arnaud Upcycling Assistant",
              })}
            </Text>
          </Group>
        }
        radius="md"
        size="md"
        overlayProps={{ backgroundOpacity: 0.15 }}
        styles={{
          inner: {
            alignItems: "flex-end",
            justifyContent: "flex-end",
            padding: "20px",
          },
          content: {
            margin: 0,
          },
        }}
        transitionProps={{ transition: "fade-up", duration: 200 }}
      >
        <Stack gap="md" style={{ height: "450px" }}>
          <ScrollArea
            style={{ flex: 1, paddingRight: "10px" }}
            viewportRef={viewportRef}
          >
            <Stack gap="sm">
              {messages.map((msg) => {
                const isBot = msg.sender === "bot";
                return (
                  <Group
                    key={msg.id}
                    justify={isBot ? "flex-start" : "flex-end"}
                    align="flex-start"
                  >
                    <Paper
                      px="md"
                      py="sm"
                      radius="lg"
                      bg={
                        isBot
                          ? "light-dark(var(--mantine-color-gray-1), var(--mantine-color-dark-6))"
                          : "var(--upagain-neutral-green, #5a9e6f)"
                      }
                      c={
                        isBot
                          ? "light-dark(var(--mantine-color-black), var(--mantine-color-white))"
                          : "white"
                      }
                      style={{
                        maxWidth: "80%",
                        borderTopLeftRadius: isBot ? 2 : undefined,
                        borderBottomRightRadius: !isBot ? 2 : undefined,
                      }}
                    >
                      <Text size="sm" style={{ whiteSpace: "pre-line" }}>
                        {msg.text}
                      </Text>
                    </Paper>
                  </Group>
                );
              })}
              {loading && (
                <Group justify="flex-start">
                  <Paper
                    px="md"
                    py="sm"
                    radius="lg"
                    bg="light-dark(var(--mantine-color-gray-1), var(--mantine-color-dark-6))"
                    c="light-dark(var(--mantine-color-black), var(--mantine-color-white))"
                    style={{ borderTopLeftRadius: 2 }}
                  >
                    <Group gap="xs">
                      <Loader
                        size="xs"
                        color="var(--upagain-neutral-green, #5a9e6f)"
                      />
                      <Text size="xs" c="dimmed">
                        {t("common:chatbot.thinking", {
                          defaultValue: "Thinking...",
                        })}
                      </Text>
                    </Group>
                  </Paper>
                </Group>
              )}
            </Stack>
          </ScrollArea>

          <Box
            style={{
              borderTop: "1px solid var(--mantine-color-gray-3)",
              paddingTop: "10px",
            }}
          >
            <Group gap="xs">
              <TextInput
                placeholder={t("common:chatbot.placeholder", {
                  defaultValue: "Ask me anything about upcycling...",
                })}
                value={input}
                onChange={(e) => setInput(e.currentTarget.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                style={{ flex: 1 }}
                disabled={loading}
              />
              <ActionIcon
                onClick={handleSend}
                size="lg"
                radius="md"
                color="var(--upagain-neutral-green, #5a9e6f)"
                disabled={!input.trim() || loading}
              >
                <IconSend size={18} />
              </ActionIcon>
            </Group>
          </Box>
        </Stack>
      </Modal>
    </>
  );
}
