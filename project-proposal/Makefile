all: proposal

MAIN=proposal
OPTIONS=--interaction=nonstopmode

TEXINPUTS= Makefile \
	$(MAIN).tex \
	sections/01-basic-info.tex \
	sections/02-background.tex \
	sections/03-objectives.tex \
	sections/04-data-sources.tex \
	sections/05-data-processing.tex \
	sections/06-vis-design.tex \
	sections/07-vis-features.tex \
	sections/08-schedule.tex \
	preamble.sty

SHELL=/bin/bash
FIGURES:=$(shell find figures/* -type f)

once:
	pdflatex $(MAIN)

$(MAIN): $(TEXINPUTS) $(FIGURES)
	latexmk -pdf -pvc -pdflatex="pdflatex $(OPTIONS)" $(MAIN)

clean:
	rm -f $(MAIN).{aux,bbl,bcf,blg}
	rm -f $(MAIN).{fls,log,nav,out}
	rm -f $(MAIN).run.xml
	rm -f $(MAIN).fdb_latexmk

distclean: clean
	rm -f $(MAIN).pdf

.PHONY: clean all
