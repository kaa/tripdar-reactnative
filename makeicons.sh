#!/bin/bash
dir=`pwd`
for i in $( ls *.svg ); do
  name=`basename -s .svg $i`
  inkscape $dir/$i -d 300 -z --export-png $dir/$name.png -w 30 -h 30
  inkscape $dir/$i -d 300 -z --export-png $dir/$name@2x.png -w 60 -h 60
  inkscape $dir/$i -d 300 -z --export-png $dir/$name@3x.png -w 90 -h 90
done