// sandpack-files.ts

export const terminalExample = `
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        System.out.print("Enter a number: ");
        int number = scanner.nextInt();
        System.out.println("You entered: " + number);
        System.out.println("2 + 2 = " + (2 + 2));
    }
}
`;

export const basicHtml = `
<!DOCTYPE html>
<html>
<head>
    <title>Sample HTML</title>
</head>
<body>
    <h1>Hello World</h1>
</body>
</html>
`;

export const basicJs = `
console.log('Hello, world!');
const add = (a, b) => a + b;
console.log('2 + 2 =', add(2, 2));
`;
