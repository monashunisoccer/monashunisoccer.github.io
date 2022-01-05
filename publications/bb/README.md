Ball and Banters should be dropped here.

Due to the gitattributes they should be uploaded to the LFS.

To generate the thumbnails, use poppler (or equiv)

```shell
pdftocairo 2012-ball-and-banter.pdf -jpeg -singlefile -scale-to-x 125 -scale-to-y -1
```

To do it on all the PDFs

```shell
find . -type f -name "*.pdf" -exec pdftocairo {} -jpeg -singlefile -scale-to-x 125 -scale-to-y -1 \; 
```
