import requests
from bs4 import BeautifulSoup, Comment

url = "https://docs.fastlane.tools/actions/swiftlint/"


def scrap_action():
	# Fetch the webpage content
	response = requests.get(url)

	# Check if the request was successful
	if response.status_code == 200:
		# Parse the HTML content using BeautifulSoup
		soup = BeautifulSoup(response.text, 'html.parser')

		# Find the div with the class "section"
		section_div = soup.find('div', {'class': 'section'})

		# Extract and print the content
		if section_div:
			# Remove comments
			# for comment in section_div.find_all(text=lambda text: isinstance(text, Comment)):
			# 	comment.extract()

			content = section_div.prettify()
			print(content)
			return(content)
		else:
			print("No div with class 'section' found.")
	else:
		print(f"Failed to fetch page content. Status code: {response.status_code}")


scrap_action()