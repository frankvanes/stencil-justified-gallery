
# Algorithm
The justification algorithm is straightforward. It builds upon the fact that aspect ratios can be added up.

Let's say we have three photos with aspect ratio 4:3 (=1.33333) in a row and one with aspect ratio 3:4 (=0.75). The combined aspect ratio is then 4.75. With a preferred row height of 300px, the total width of the row would become 4.75 * 300 = 1425px.
--> explain how to calculate which photos will and which photos won't be on the row
--> explain how to do the actual scaling

1: Calculate the threshold 