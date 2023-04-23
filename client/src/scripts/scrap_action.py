import requests
import sys
from bs4 import BeautifulSoup, Comment

action_name = sys.argv[1]
url = "https://docs.fastlane.tools/actions/" + action_name + "/"


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
            # Remove img tags with local assets
            for img in section_div.find_all('img'):
                src = img.get('src', '')
                if not src.startswith('https'):
                    img.extract()

            content = section_div.prettify()
            print(content)
            return (content)
        else:
            print("No div with class 'section' found.")
    else:
        print(
            f"Failed to fetch page content. Status code: {response.status_code}")


scrap_action()
