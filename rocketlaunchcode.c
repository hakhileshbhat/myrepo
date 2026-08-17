#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#ifdef _WIN32
#include <windows.h>
#define SLEEP(ms) Sleep(ms)
#else
#include <unistd.h>
#define SLEEP(ms) usleep((ms) * 1000)
#endif

#define MAX_ATTEMPTS 3
#define ADMIN_PASSWORD "launch123"

void countdown() {
  printf("\nAdmin access granted. Initiating launch sequence...\n\n");
  for (int i = 10; i > 0; i--) {
    printf("T-minus %d seconds...\n", i);
    SLEEP(1000); // Wait for 1 second
  }
  printf("\nLIFTOFF! The rocket has successfully launched.\n");
}

int main() {
  char password[50];
  int attempts = 0;

  printf("=========================================\n");
  printf("       ROCKET LAUNCH CONTROL SYSTEM      \n");
  printf("=========================================\n\n");

  while (attempts < MAX_ATTEMPTS) {
    printf("Enter admin password (Attempt %d/%d): ", attempts + 1,
           MAX_ATTEMPTS);

    // Read input
    if (fgets(password, sizeof(password), stdin) != NULL) {
      size_t len = strlen(password);

      // If the newline character is present, remove it.
      if (len > 0 && password[len - 1] == '\n') {
        password[len - 1] = '\0';
      } else {
        // Otherwise, the input was truncated. Clear the remaining buffer.
        int ch;
        while ((ch = getchar()) != '\n' && ch != EOF)
          ;
      }

      if (strcmp(password, ADMIN_PASSWORD) == 0) {
        countdown();
        return 0; // Success
      } else {
        printf("Access denied. Incorrect password.\n\n");
        attempts++;
      }
    } else {
      // Handle EOF (e.g. Ctrl+D / Ctrl+Z) or read error
      printf("\nInput error or EOF reached. Aborting.\n");
      break;
    }
  }

  printf("MAXIMUM LOGIN ATTEMPTS EXCEEDED.\n");
  printf("SYSTEM LOCKED. LAUNCH SEQUENCE ABORTED.\n");
  return 1; // Failure
}
