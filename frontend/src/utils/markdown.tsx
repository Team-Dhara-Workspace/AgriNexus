import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * Parses italics inside bold segments or normal text segments.
 * Handles *italic* syntax.
 */
const parseItalics = (text: string) => {
  const italicRegex = /(\*.*?\*)/g;
  const parts = text.split(italicRegex);

  return parts.map((part, index) => {
    if (part.startsWith('*') && part.endsWith('*')) {
      return (
        <Text key={index} style={styles.italicText}>
          {part.slice(1, -1)}
        </Text>
      );
    }
    return part;
  });
};

/**
 * Splits text into inline formatting parts (bold, italic, plain).
 * Handles **bold** syntax.
 */
export const parseInlineStyles = (text: string, isUser: boolean) => {
  const boldRegex = /(\*\*.*?\*\*)/g;
  const parts = text.split(boldRegex);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const boldText = part.slice(2, -2);
      return (
        <Text key={index} style={[styles.boldText, isUser ? styles.userTextInline : styles.botTextInline]}>
          {parseItalics(boldText)}
        </Text>
      );
    }
    return <React.Fragment key={index}>{parseItalics(part)}</React.Fragment>;
  });
};

/**
 * Render Markdown formatted text into React Native JSX elements.
 * Handles:
 * - Headings (e.g. ### Header)
 * - Bullet list items (e.g. - item, * item)
 * - Numbered list items (e.g. 1. item)
 * - Inline formatting (**bold**, *italic*)
 * - Newlines and spacing
 */
export const renderFormattedMessage = (text: string, isUser: boolean) => {
  if (!text) return null;

  // Split by newline to process line by line
  const lines = text.split('\n');

  return lines.map((line, index) => {
    const trimmedLine = line.trim();

    // 1. Empty lines
    if (trimmedLine === '') {
      return <View key={index} style={styles.emptyLine} />;
    }

    // 2. Headings (e.g., # Heading, ## Heading, ### Heading)
    if (trimmedLine.startsWith('#')) {
      const headerMatch = trimmedLine.match(/^(#{1,6})\s+(.*)/);
      if (headerMatch) {
        const level = headerMatch[1].length;
        const headingText = headerMatch[2];
        
        const headingStyle = level === 1 
          ? styles.h1 
          : level === 2 
            ? styles.h2 
            : styles.h3;

        return (
          <Text key={index} style={[headingStyle, isUser ? styles.userText : styles.botTextHeader]}>
            {parseInlineStyles(headingText, isUser)}
          </Text>
        );
      }
    }

    // 3. Bullet list items (e.g., - item or * item or • item)
    if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ') || trimmedLine.startsWith('• ')) {
      const bulletContent = trimmedLine.replace(/^[-*•]\s+/, '');
      return (
        <View key={index} style={styles.listItemRow}>
          <Text style={[styles.bulletPoint, isUser ? styles.userText : styles.botBullet]}>•</Text>
          <Text style={[styles.listItemText, isUser ? styles.userText : styles.botText]}>
            {parseInlineStyles(bulletContent, isUser)}
          </Text>
        </View>
      );
    }

    // 4. Numbered list items (e.g., 1. item)
    const numberedMatch = trimmedLine.match(/^(\d+)\.\s+(.*)/);
    if (numberedMatch) {
      const num = numberedMatch[1];
      const numberContent = numberedMatch[2];
      return (
        <View key={index} style={styles.listItemRow}>
          <Text style={[styles.numberPrefix, isUser ? styles.userText : styles.botNumber]}>{num}.</Text>
          <Text style={[styles.listItemText, isUser ? styles.userText : styles.botText]}>
            {parseInlineStyles(numberContent, isUser)}
          </Text>
        </View>
      );
    }

    // 5. Standard paragraph line
    return (
      <Text key={index} style={[styles.paragraph, isUser ? styles.userText : styles.botText]}>
        {parseInlineStyles(line, isUser)}
      </Text>
    );
  });
};

/**
 * Helper to strip markdown symbols completely, returning plain text.
 */
export const stripMarkdown = (text: string): string => {
  if (!text) return '';
  return text
    // Remove bold/italics markers
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    // Remove headings markers
    .replace(/^#+\s+/gm, '')
    // Remove bullet point markers
    .replace(/^[-*•]\s+/gm, '')
    // Remove numbered lists markers
    .replace(/^(\d+)\.\s+/gm, '');
};

const styles = StyleSheet.create({
  emptyLine: {
    height: 8,
  },
  boldText: {
    fontWeight: 'bold',
  },
  italicText: {
    fontStyle: 'italic',
  },
  userTextInline: {
    color: '#ffffff',
  },
  botTextInline: {
    color: '#111827',
  },
  h1: {
    fontSize: 19,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
    lineHeight: 24,
  },
  h2: {
    fontSize: 17,
    fontWeight: 'bold',
    marginTop: 6,
    marginBottom: 3,
    lineHeight: 22,
  },
  h3: {
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 4,
    marginBottom: 2,
    lineHeight: 20,
  },
  botTextHeader: {
    color: '#1f2937', // gray-800
  },
  listItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 2,
    paddingLeft: 4,
  },
  bulletPoint: {
    marginRight: 6,
    fontSize: 15,
    lineHeight: 22,
  },
  botBullet: {
    color: '#1A744C',
    fontWeight: 'bold',
  },
  numberPrefix: {
    marginRight: 4,
    fontSize: 15,
    fontWeight: 'bold',
    lineHeight: 22,
  },
  botNumber: {
    color: '#1A744C',
  },
  listItemText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
    marginVertical: 1,
  },
  userText: {
    color: '#ffffff',
  },
  botText: {
    color: '#374151', // gray-700
  },
});
