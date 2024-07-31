// sandpack-files.ts

export const javaCode = `
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

export const htmlCode = `
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

export const jsCode = `
console.log('Hello, world!');
const add = (a, b) => a + b;
console.log('2 + 2 =', add(2, 2));
`;

export const pythonCode = `
def greet(name):
    return f"Hello, {name}!"

print(greet("World"))
`;

export const cssCode = `
body {
    background-color: #f0f0f0;
    color: #333;
}

h1 {
    color: #0070f3;
}
`;
