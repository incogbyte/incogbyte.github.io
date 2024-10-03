#!/bin/bash

# Specify the directory where your files are located
directory="."

# Navigate to the directory
cd "$directory" || exit

# Loop through the files in the directory
for file in *; do
  # Check if the file name contains spaces
  if [[ "$file" == *" "* ]]; then
    # Replace spaces with underscores in the file name
    new_name="${file// /_}"

    # Rename the file
    mv "$file" "$new_name"
    echo "Renamed: $file -> $new_name"
  fi
done

