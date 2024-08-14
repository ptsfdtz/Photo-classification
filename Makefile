CC = gcc
CFLAGS = -Iinclude -Wall
LDFLAGS = 

all: main

main: src/main.c
	$(CC) -o main src/main.c $(CFLAGS) $(LDFLAGS)

clean:
	rm -f main
