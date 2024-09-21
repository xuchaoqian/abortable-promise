.PHONY : default install build start test clean

NPM=npm

default: build

install:
	${NPM} install

build:
	${NPM} run build

test:
	${NPM} run test

clean:
	rm -rf node_modules dist/*
	rm -f *.log package-lock.json
