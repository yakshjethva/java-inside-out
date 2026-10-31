/**
 * The "journey machine": one line of Java followed from source code to the
 * CPU. The class-file facts come from compiling Hello.java with javac 25.0.4:
 *
 *   public class Hello {
 *       public static void main(String[] args) {
 *           System.out.println("<message>");
 *       }
 *   }
 *
 * Changing the message changes only one constant-pool entry, so the bytecode
 * and constant-pool indices stay the same and the file size is 404 bytes plus
 * the message's length in modified UTF-8.
 */

export const MAX_MESSAGE_LENGTH = 32;
export const DEFAULT_MESSAGE = 'Hello!';
export const HELLO_CLASS_BASE_SIZE = 404;

/**
 * Keeps text that can sit inside a Java string literal unescaped: no quotes,
 * no backslashes, no control characters, at most 32 characters (code points).
 * Bidirectional controls are dropped too, so the text cannot reorder the code
 * shown around it.
 */
export function sanitizeMessage(input: string): string {
  const allowed = [...input].filter(
    (ch) => ch !== '"' && ch !== '\\' && !/[\p{Cc}\p{Bidi_Control}]/u.test(ch),
  );
  return allowed.slice(0, MAX_MESSAGE_LENGTH).join('');
}

/**
 * Bytes the string occupies in a class file's CONSTANT_Utf8 entry (JVMS
 * §4.4.7, "modified UTF-8"): each UTF-16 code unit is encoded separately, so
 * a character outside the Basic Multilingual Plane takes 6 bytes, and U+0000
 * takes 2.
 */
export function modifiedUtf8Length(text: string): number {
  let length = 0;
  for (let i = 0; i < text.length; i++) {
    const unit = text.charCodeAt(i);
    if (unit >= 0x0001 && unit <= 0x007f) length += 1;
    else if (unit <= 0x07ff) length += 2;
    else length += 3;
  }
  return length;
}

export function helloClassSize(message: string): number {
  return HELLO_CLASS_BASE_SIZE + modifiedUtf8Length(message);
}

/** `javap -c Hello`, method main, with the message substituted. */
export function helloMainBytecode(message: string): string[] {
  return [
    '0: getstatic     #7    // Field java/lang/System.out:Ljava/io/PrintStream;',
    `3: ldc           #13   // String ${message}`,
    '5: invokevirtual #15   // Method java/io/PrintStream.println:(Ljava/lang/String;)V',
    '8: return',
  ];
}

/** First bytes of Hello.class: the magic number and the class-file version. */
export const HELLO_CLASS_HEADER = ['CA', 'FE', 'BA', 'BE', '00', '00', '00', '45'];
