/* =====================================================================
   QUESTION BANKS
   - MCQ: 15 questions per language, 2 marks each (30 marks)
   - CODING: language-agnostic pool; each paper picks 4 (5 marks each)
   Each MCQ: { q, options[4], answer (index 0-3), why }
   ===================================================================== */

const MCQ_BANK = {
  c: [
    { q: "Which header file must be included to use printf() and scanf() in C?",
      options: ["<stdlib.h>", "<stdio.h>", "<string.h>", "<conio.h>"], answer: 1,
      why: "printf and scanf are declared in <stdio.h> (standard input/output)." },
    { q: "What is the size of an int on most 32-bit and 64-bit systems using GCC?",
      options: ["2 bytes", "4 bytes", "8 bytes", "Depends on the compiler flag -O2"], answer: 1,
      why: "On common platforms (ILP32 and LP64) int is 4 bytes; only the C standard minimum (16 bits) is guaranteed." },
    { q: "What will `printf(\"%d\", 7 / 2);` print?",
      options: ["3.5", "3", "4", "Compilation error"], answer: 1,
      why: "Both operands are integers, so integer division truncates toward zero, giving 3." },
    { q: "Which of the following correctly declares a pointer to an integer?",
      options: ["int ptr;", "int *ptr;", "int &ptr;", "pointer int ptr;"], answer: 1,
      why: "The asterisk in a declaration makes ptr a pointer to int." },
    { q: "What does the `&` operator do when applied to a variable, e.g. `&x`?",
      options: ["Performs bitwise AND with 0", "Returns the value of x", "Returns the memory address of x", "Dereferences x"], answer: 2,
      why: "Unary & is the address-of operator." },
    { q: "Which function allocates memory dynamically and initialises it to zero?",
      options: ["malloc()", "calloc()", "realloc()", "alloc()"], answer: 1,
      why: "calloc allocates and zero-fills; malloc leaves the memory uninitialised." },
    { q: "What is the output of this code?\n\nint a[] = {10, 20, 30};\nprintf(\"%d\", *(a + 1));",
      options: ["10", "20", "30", "Address of a[1]"], answer: 1,
      why: "a + 1 points to the second element; dereferencing gives 20." },
    { q: "Strings in C are terminated by which character?",
      options: ["'\\n'", "'\\0'", "' ' (space)", "EOF"], answer: 1,
      why: "C strings are null-terminated character arrays; '\\0' marks the end." },
    { q: "What is the default storage class for a variable declared inside a function?",
      options: ["static", "extern", "register", "auto"], answer: 3,
      why: "Local variables are automatic (auto) by default and live on the stack." },
    { q: "Which loop guarantees the body executes at least once?",
      options: ["for", "while", "do-while", "None of these"], answer: 2,
      why: "do-while tests the condition after executing the body." },
    { q: "What does `sizeof(char)` evaluate to in C?",
      options: ["Always 1", "Always 2", "Depends on the OS", "Undefined"], answer: 0,
      why: "The C standard defines sizeof(char) as exactly 1." },
    { q: "Which of these is NOT a valid C keyword?",
      options: ["typedef", "volatile", "class", "enum"], answer: 2,
      why: "class is a C++ keyword; C has no classes." },
    { q: "What will `printf(\"%d\", 5 & 3);` print?",
      options: ["1", "7", "8", "15"], answer: 0,
      why: "5 = 101, 3 = 011; bitwise AND = 001 = 1." },
    { q: "How do you pass an array to a function in C?",
      options: ["By value (a copy of the array is made)", "By reference (the address of the first element is passed)", "Arrays cannot be passed to functions", "Only through a struct"], answer: 1,
      why: "An array name decays to a pointer to its first element, so the function receives an address." },
    { q: "What is the value of `x` after `int x = 5; x += x++ + ++x;` in C?",
      options: ["17", "18", "16", "Undefined behaviour"], answer: 3,
      why: "x is modified more than once without a sequence point, which the C standard defines as undefined behaviour." }
  ],

  cpp: [
    { q: "Which header is required to use std::cout and std::cin?",
      options: ["<stdio.h>", "<iostream>", "<istream.h>", "<conio.h>"], answer: 1,
      why: "cout and cin are declared in <iostream>." },
    { q: "Which C++ feature allows a function to have the same name but different parameter lists?",
      options: ["Function overriding", "Function overloading", "Templates", "Inline functions"], answer: 1,
      why: "Overloading = same name, different signatures, resolved at compile time." },
    { q: "What is the default access specifier for members of a `class` in C++?",
      options: ["public", "protected", "private", "friend"], answer: 2,
      why: "class members are private by default; struct members are public by default." },
    { q: "Which keyword is used to allocate memory dynamically in C++?",
      options: ["malloc", "alloc", "new", "create"], answer: 2,
      why: "new allocates and constructs; delete frees it." },
    { q: "What is a constructor?",
      options: ["A function that is called when an object is destroyed", "A special member function invoked automatically when an object is created", "A static function that returns the class size", "A function that must return an int"], answer: 1,
      why: "Constructors have the class name, no return type, and run on object creation." },
    { q: "What does the `virtual` keyword enable?",
      options: ["Compile-time polymorphism", "Runtime polymorphism (dynamic dispatch)", "Automatic memory management", "Multiple inheritance"], answer: 1,
      why: "virtual functions are resolved at runtime through the vtable based on the object's dynamic type." },
    { q: "What is the output?\n\nint x = 10;\nint &r = x;\nr = 20;\nstd::cout << x;",
      options: ["10", "20", "Garbage value", "Compilation error"], answer: 1,
      why: "r is a reference (alias) to x, so assigning to r changes x." },
    { q: "Which STL container stores unique elements in sorted order?",
      options: ["std::vector", "std::list", "std::set", "std::deque"], answer: 2,
      why: "std::set is an ordered associative container with unique keys." },
    { q: "Which operator cannot be overloaded in C++?",
      options: ["+", "[]", "::", "=="], answer: 2,
      why: "The scope resolution (::), member access (.), .* and ?: operators cannot be overloaded." },
    { q: "What is the purpose of a destructor?",
      options: ["To initialise members", "To release resources when an object goes out of scope or is deleted", "To copy an object", "To overload the = operator"], answer: 1,
      why: "~ClassName() runs automatically when the object's lifetime ends." },
    { q: "What does `std::vector<int> v(5, 2);` create?",
      options: ["A vector with elements 5 and 2", "A vector of 5 elements, each equal to 2", "A vector of 2 elements, each equal to 5", "A compilation error"], answer: 1,
      why: "The (count, value) constructor makes count copies of value." },
    { q: "Which statement about templates is correct?",
      options: ["They are resolved at runtime", "They allow writing generic code that works with any type", "They can only be used with classes", "They replace inheritance"], answer: 1,
      why: "Templates generate type-specific code at compile time from a generic definition." },
    { q: "What is the output?\n\nclass A { public: void show(){ std::cout << \"A\"; } };\nclass B : public A { public: void show(){ std::cout << \"B\"; } };\nA *p = new B(); p->show();",
      options: ["A", "B", "AB", "Compilation error"], answer: 0,
      why: "show() is not virtual, so the call is resolved statically using the pointer type A." },
    { q: "What does `const int *p` mean?",
      options: ["p is a constant pointer to int", "p is a pointer to a constant int (value cannot be changed through p)", "Both pointer and value are constant", "Invalid declaration"], answer: 1,
      why: "const before the type applies to the pointee; `int * const p` would be a constant pointer." },
    { q: "Which of these correctly catches all exceptions in C++?",
      options: ["catch(all)", "catch(...)", "catch(Exception e)", "catch(*)"], answer: 1,
      why: "The ellipsis handler catch(...) matches any thrown type." }
  ],

  python: [
    { q: "What is the output of `print(type([]))`?",
      options: ["<class 'tuple'>", "<class 'list'>", "<class 'array'>", "<class 'dict'>"], answer: 1,
      why: "[] is an empty list literal." },
    { q: "Which of the following data types is immutable?",
      options: ["list", "dict", "set", "tuple"], answer: 3,
      why: "Tuples cannot be modified after creation; lists, dicts and sets are mutable." },
    { q: "What does `len(\"Python\")` return?",
      options: ["5", "6", "7", "Error"], answer: 1,
      why: "The string has six characters." },
    { q: "What is the output of `print(10 // 3, 10 % 3)`?",
      options: ["3.33 1", "3 1", "3 3", "4 1"], answer: 1,
      why: "// is floor division (3) and % is the remainder (1)." },
    { q: "How do you start a block of code in Python (e.g. after `if x > 0`)?",
      options: ["With curly braces { }", "With a colon and indentation", "With the keyword begin", "With parentheses"], answer: 1,
      why: "Python uses a colon followed by consistently indented lines to define blocks." },
    { q: "What does `list(range(2, 10, 3))` produce?",
      options: ["[2, 5, 8]", "[2, 3, 4, 5, 6, 7, 8, 9]", "[3, 6, 9]", "[2, 5, 8, 11]"], answer: 0,
      why: "range(start, stop, step) yields 2, 5, 8 (stop is exclusive)." },
    { q: "Which keyword is used to define a function in Python?",
      options: ["function", "func", "def", "define"], answer: 2,
      why: "def name(params): defines a function." },
    { q: "What is the output?\n\nx = [1, 2, 3]\ny = x\ny.append(4)\nprint(x)",
      options: ["[1, 2, 3]", "[1, 2, 3, 4]", "[4]", "Error"], answer: 1,
      why: "y references the same list object as x, so the append is visible through x." },
    { q: "Which statement correctly handles an exception in Python?",
      options: ["try: ... catch: ...", "try: ... except: ...", "try: ... rescue: ...", "do: ... except: ..."], answer: 1,
      why: "Python uses try/except (optionally with else and finally)." },
    { q: "What does `\"hello\".upper()` return?",
      options: ["Hello", "HELLO", "hello", "An error – strings are immutable"], answer: 1,
      why: "upper() returns a new uppercase string; immutability just means the original is unchanged." },
    { q: "What is the output of `print(2 ** 3 ** 2)`?",
      options: ["64", "512", "36", "18"], answer: 1,
      why: "** is right-associative: 2 ** (3 ** 2) = 2 ** 9 = 512." },
    { q: "Which of these creates a dictionary?",
      options: ["d = [1: 'a']", "d = (1: 'a')", "d = {1: 'a'}", "d = <1: 'a'>"], answer: 2,
      why: "Curly braces with key: value pairs create a dict." },
    { q: "What does a list comprehension `[x*x for x in range(4)]` produce?",
      options: ["[0, 1, 4, 9]", "[1, 4, 9, 16]", "[0, 1, 2, 3]", "[1, 2, 3, 4]"], answer: 0,
      why: "range(4) yields 0..3; squaring gives 0, 1, 4, 9." },
    { q: "What is `self` in a Python class method?",
      options: ["A keyword that refers to the class", "A reference to the current instance of the class", "A global variable", "A reserved word that cannot be renamed"], answer: 1,
      why: "self is the conventional name for the instance passed as the first argument; it is not a keyword." },
    { q: "What is the output of `print(bool(0), bool(\"\"), bool([]), bool(\"0\"))`?",
      options: ["False False False False", "False False False True", "True True True True", "False True False True"], answer: 1,
      why: "0, empty string and empty list are falsy; the non-empty string \"0\" is truthy." }
  ],

  java: [
    { q: "Which of the following is the correct signature of the Java main method?",
      options: ["public void main(String args)", "public static void main(String[] args)", "static public main(String[] args)", "public static int main(String[] args)"], answer: 1,
      why: "The JVM looks for public static void main(String[] args)." },
    { q: "What is the size of an `int` in Java?",
      options: ["Depends on the platform", "16 bits", "32 bits", "64 bits"], answer: 2,
      why: "Java primitives have fixed sizes; int is always 32 bits." },
    { q: "Which keyword is used to inherit a class in Java?",
      options: ["implements", "inherits", "extends", "super"], answer: 2,
      why: "class B extends A – implements is used for interfaces." },
    { q: "What is the default value of an instance variable of type `boolean`?",
      options: ["true", "false", "null", "0"], answer: 1,
      why: "Uninitialised boolean fields default to false (local variables have no default)." },
    { q: "Which of these is NOT a Java primitive type?",
      options: ["int", "char", "String", "double"], answer: 2,
      why: "String is a class (reference type), not a primitive." },
    { q: "What does the `final` keyword do when applied to a variable?",
      options: ["Makes it static", "Makes its value constant after initialisation", "Makes it accessible from all packages", "Deletes it after use"], answer: 1,
      why: "A final variable can be assigned only once." },
    { q: "What is the output?\n\nString a = \"Java\";\nString b = new String(\"Java\");\nSystem.out.println(a == b);\nSystem.out.println(a.equals(b));",
      options: ["true true", "false true", "true false", "false false"], answer: 1,
      why: "== compares references (different objects); equals() compares content." },
    { q: "Which collection class does NOT allow duplicate elements?",
      options: ["ArrayList", "LinkedList", "HashSet", "Vector"], answer: 2,
      why: "Set implementations such as HashSet reject duplicates." },
    { q: "What is the parent class of all classes in Java?",
      options: ["java.lang.Class", "java.lang.Object", "java.lang.Super", "java.lang.Base"], answer: 1,
      why: "Every class implicitly extends java.lang.Object." },
    { q: "Which exception is thrown when dividing an integer by zero in Java?",
      options: ["NullPointerException", "ArithmeticException", "NumberFormatException", "DivideByZeroException"], answer: 1,
      why: "Integer division by zero throws ArithmeticException (floating-point gives Infinity/NaN)." },
    { q: "What does an `interface` contain by default (prior to Java 8 default methods)?",
      options: ["Concrete methods and instance variables", "Abstract methods and constants", "Only constructors", "Static blocks only"], answer: 1,
      why: "Interface methods are implicitly public abstract and fields are public static final." },
    { q: "What is the output of `System.out.println(10 + 20 + \"30\");`?",
      options: ["102030", "3030", "60", "1020 30"], answer: 1,
      why: "Left-to-right: 10 + 20 = 30 (int), then 30 + \"30\" concatenates to \"3030\"." },
    { q: "Which keyword prevents a method from being overridden?",
      options: ["static", "private", "final", "abstract"], answer: 2,
      why: "final methods cannot be overridden in subclasses." },
    { q: "What is the purpose of the `super` keyword?",
      options: ["To create a new object", "To refer to the immediate parent class (its members or constructor)", "To declare a superclass", "To call a static method"], answer: 1,
      why: "super.method() or super(...) accesses the parent class." },
    { q: "Which statement about `ArrayList` is correct?",
      options: ["Its size is fixed at creation", "It can store primitive int directly", "It is a resizable array implementation of List", "It is synchronized by default"], answer: 2,
      why: "ArrayList grows dynamically; it stores objects (autoboxing wraps primitives) and is not synchronized." }
  ]
};

/* =====================================================================
   CODING QUESTION POOL (from the Technical Interview Questionnaire)
   Every program reads from standard input and writes to standard output.
   tests: hidden test cases used when the code is executed.
   rubric: per-language keywords used only if execution is unavailable.
   ===================================================================== */
const CODING_POOL = {
  pascal: {
    title: "Pascal's Triangle",
    text: "Write a program that reads an integer n from standard input and prints Pascal's Triangle with n rows. Print the numbers of each row separated by a single space, one row per line (left-aligned).",
    sample: { input: "4", output: "1\n1 1\n1 2 1\n1 3 3 1" },
    tests: [
      { input: "4", output: "1\n1 1\n1 2 1\n1 3 3 1" },
      { input: "1", output: "1" },
      { input: "6", output: "1\n1 1\n1 2 1\n1 3 3 1\n1 4 6 4 1\n1 5 10 10 5 1" }
    ],
    modelAnswer: "Each row starts and ends with 1; every interior value is the sum of the two values above it (row[i-1][j-1] + row[i-1][j]).",
    rubric: ["for", "+", "1"], compare: "tokens"
  },
  prime: {
    title: "Prime Number Check (with input validation)",
    text: "Read a value from standard input and print \"Prime\" if it is a prime number, otherwise \"Not Prime\". If the input is not a valid integer (e.g. \"abc\"), the program must NOT crash: it should print \"Invalid input\". (In Python use try/except; in Java use try/catch; in C/C++ validate the input.)",
    sample: { input: "7", output: "Prime" },
    tests: [
      { input: "7", output: "Prime" },
      { input: "12", output: "Not Prime" },
      { input: "1", output: "Not Prime" },
      { input: "abc", output: "Invalid input" },
      { input: "97", output: "Prime" }
    ],
    modelAnswer: "Treat n <= 1 as not prime; test divisors up to sqrt(n); wrap the integer conversion in try/except (or validate with sscanf/strtol) so non-numeric input prints \"Invalid input\".",
    rubric: ["%", "Prime", "Invalid"], compare: "tokens"
  },
  numpyramid: {
    title: "Numeric Pyramid",
    text: "Read n and print the following numeric pyramid for n rows (example for n = 4). Each row counts down from the row number to 1 then back up. Numbers are separated by one space and rows are centered (right-aligned to the last row).\n\n      1\n    2 1 2\n  3 2 1 2 3\n4 3 2 1 2 3 4",
    sample: { input: "4", output: "      1\n    2 1 2\n  3 2 1 2 3\n4 3 2 1 2 3 4" },
    tests: [
      { input: "4", output: "      1\n    2 1 2\n  3 2 1 2 3\n4 3 2 1 2 3 4" },
      { input: "1", output: "1" },
      { input: "6", output: "          1\n        2 1 2\n      3 2 1 2 3\n    4 3 2 1 2 3 4\n  5 4 3 2 1 2 3 4 5\n6 5 4 3 2 1 2 3 4 5 6" }
    ],
    modelAnswer: "Row i: print 2*(n-i) spaces, then i down to 1 then 2 up to i, joined by single spaces.",
    rubric: ["for", " "], compare: "lines"
  },
  starcenter: {
    title: "Centered Star Pyramid",
    text: "Read the number of levels and print a centered star pyramid (example for levels = 5):\n\n    *\n   ***\n  *****\n *******\n*********",
    sample: { input: "5", output: "    *\n   ***\n  *****\n *******\n*********" },
    tests: [
      { input: "5", output: "    *\n   ***\n  *****\n *******\n*********" },
      { input: "1", output: "*" },
      { input: "3", output: "  *\n ***\n*****" }
    ],
    modelAnswer: "Row i (0-based): print (levels-1-i) spaces followed by (2*i+1) stars.",
    rubric: ["for", "*"], compare: "lines"
  },
  starleft: {
    title: "Left-aligned Star Pyramid",
    text: "Read n and print a left-aligned, increasing star pyramid with n rows where row i has 2*i-1 stars (example for n = 5):\n\n*\n***\n*****\n*******\n*********",
    sample: { input: "5", output: "*\n***\n*****\n*******\n*********" },
    tests: [
      { input: "5", output: "*\n***\n*****\n*******\n*********" },
      { input: "1", output: "*" },
      { input: "3", output: "*\n***\n*****" }
    ],
    modelAnswer: "Row i (1-based) prints 2*i-1 stars with no leading spaces.",
    rubric: ["for", "*"], compare: "lines"
  },
  standalone: {
    title: "First Standalone Character",
    text: "Read a string of lowercase letters and find the first character that does not belong to any consecutive repeating group. A character belongs to a repeating group if the same character appears immediately before or after it. Print the first standalone character; if none exists print \"No Character Found\".\n\nExample: input aabbccdefggd -> output d",
    sample: { input: "aabbccdefggd", output: "d" },
    tests: [
      { input: "aabbccdefggd", output: "d" },
      { input: "aabbbcda", output: "c" },
      { input: "aabbcc", output: "No Character Found" },
      { input: "xyz", output: "x" }
    ],
    modelAnswer: "Scan the string grouping consecutive identical characters; return the first character whose group length is 1, otherwise print \"No Character Found\".",
    rubric: ["No Character Found", "for"], compare: "tokens"
  },
  nonrepeat: {
    title: "First Non-Repeating Character",
    text: "Read a string and print the first character that appears exactly once in the whole string (left-to-right order). If every character repeats, print \"None\".\n\nExample: input aabbcdd -> output c",
    sample: { input: "aabbcdd", output: "c" },
    tests: [
      { input: "aabbcdd", output: "c" },
      { input: "swiss", output: "w" },
      { input: "aabb", output: "None" },
      { input: "programming", output: "p" }
    ],
    modelAnswer: "Count the frequency of each character, then scan left to right and print the first character with count 1.",
    rubric: ["for", "None"], compare: "tokens"
  },
  longestgroup: {
    title: "Longest Consecutive Repeating Group",
    text: "Read a string of lowercase letters and print the character of the longest consecutive repeating group. If several groups share the maximum length, print the character of the earliest such group.\n\nExample: input aaabbbbccdd -> output b",
    sample: { input: "aaabbbbccdd", output: "b" },
    tests: [
      { input: "aaabbbbccdd", output: "b" },
      { input: "aabbcc", output: "a" },
      { input: "abcddddde", output: "d" },
      { input: "z", output: "z" }
    ],
    modelAnswer: "Track the current run length; when a run beats the best length (strictly greater), record its character.",
    rubric: ["for", ">"], compare: "tokens"
  },
  primetriangle: {
    title: "Prime Number Triangle",
    text: "Read N and print a right-angled triangle of consecutive prime numbers with N rows, where row i contains i primes separated by single spaces.\n\nExample for N = 5:\n2\n3 5\n7 11 13\n17 19 23 29\n31 37 41 43 47",
    sample: { input: "5", output: "2\n3 5\n7 11 13\n17 19 23 29\n31 37 41 43 47" },
    tests: [
      { input: "5", output: "2\n3 5\n7 11 13\n17 19 23 29\n31 37 41 43 47" },
      { input: "1", output: "2" },
      { input: "3", output: "2\n3 5\n7 11 13" }
    ],
    modelAnswer: "Generate primes on demand with a helper isPrime(); for row i print the next i primes.",
    rubric: ["%", "for"], compare: "tokens"
  },
  missing: {
    title: "Missing Number in 1..N",
    text: "The first line of input contains N. The second line contains N-1 distinct integers from 1 to N with exactly one number missing. Print the missing number.\n\nExample:\n5\n1 2 3 5\n-> output 4",
    sample: { input: "5\n1 2 3 5", output: "4" },
    tests: [
      { input: "5\n1 2 3 5", output: "4" },
      { input: "3\n1 3", output: "2" },
      { input: "6\n6 5 4 3 1", output: "2" },
      { input: "4\n1 2 3", output: "4" }
    ],
    modelAnswer: "Expected sum = N*(N+1)/2; subtract the sum of the given numbers (or XOR all values 1..N with the array).",
    rubric: ["for", "-"], compare: "tokens"
  },
  anagram: {
    title: "Anagram Check",
    text: "Read two words (separated by a space or on separate lines) and print \"Anagram\" if they are anagrams of each other, otherwise \"Not Anagram\". Comparison is case-insensitive.\n\nExample: input listen silent -> output Anagram",
    sample: { input: "listen silent", output: "Anagram" },
    tests: [
      { input: "listen silent", output: "Anagram" },
      { input: "hello world", output: "Not Anagram" },
      { input: "Triangle integral", output: "Anagram" },
      { input: "abc abcd", output: "Not Anagram" }
    ],
    modelAnswer: "Lower-case both words, sort their characters (or count character frequencies) and compare.",
    rubric: ["Anagram", "sort"], compare: "tokens"
  },
  topk: {
    title: "Top K Frequent Elements",
    text: "The first line contains the integers of an array separated by spaces. The second line contains k. Print the k most frequent elements in descending order of frequency, separated by spaces (if two elements have the same frequency, print the smaller value first).\n\nExample:\n1 1 1 2 2 3 4 4 4 4\n2\n-> output 4 1",
    sample: { input: "1 1 1 2 2 3 4 4 4 4\n2", output: "4 1" },
    tests: [
      { input: "1 1 1 2 2 3 4 4 4 4\n2", output: "4 1" },
      { input: "5 5 6 6 7\n1", output: "5" },
      { input: "3 1 2 2 3 3 1\n3", output: "3 1 2" }
    ],
    modelAnswer: "Count frequencies in a map, sort keys by (frequency desc, value asc) and print the first k.",
    rubric: ["sort", "for"], compare: "tokens"
  }
};

/* =====================================================================
   PAPERS
   A = original order.  B = jumbled (MCQs and options shuffled, different
   set of 4 coding questions).  seed drives the deterministic shuffle.
   ===================================================================== */
const LANG_META = {
  c:      { name: "C",      piston: "c",      version: "10.2.0", ext: "c" },
  cpp:    { name: "C++",    piston: "c++",    version: "10.2.0", ext: "cpp" },
  python: { name: "Python", piston: "python", version: "3.10.0", ext: "py" },
  java:   { name: "Java",   piston: "java",   version: "15.0.2", ext: "java" }
};

const PAPERS = {
  "c-a":      { lang: "c",      label: "C – Paper A",      shuffle: false, seed: 0,  coding: ["pascal", "prime", "nonrepeat", "missing"] },
  "c-b":      { lang: "c",      label: "C – Paper B",      shuffle: true,  seed: 11, coding: ["numpyramid", "starcenter", "anagram", "longestgroup"] },
  "cpp-a":    { lang: "cpp",    label: "C++ – Paper A",    shuffle: false, seed: 0,  coding: ["starcenter", "standalone", "missing", "primetriangle"] },
  "cpp-b":    { lang: "cpp",    label: "C++ – Paper B",    shuffle: true,  seed: 23, coding: ["pascal", "starleft", "nonrepeat", "topk"] },
  "python-a": { lang: "python", label: "Python – Paper A", shuffle: false, seed: 0,  coding: ["pascal", "prime", "anagram", "topk"] },
  "python-b": { lang: "python", label: "Python – Paper B", shuffle: true,  seed: 37, coding: ["numpyramid", "standalone", "missing", "primetriangle"] },
  "java-a":   { lang: "java",   label: "Java – Paper A",   shuffle: false, seed: 0,  coding: ["starleft", "nonrepeat", "missing", "longestgroup"] },
  "java-b":   { lang: "java",   label: "Java – Paper B",   shuffle: true,  seed: 53, coding: ["prime", "starcenter", "anagram", "primetriangle"] }
};
