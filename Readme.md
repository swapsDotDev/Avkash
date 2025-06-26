# AVKASH
Avkash is a comprehensive project that integrates both a Leave Portal System and HR Management System. The system provides various functionalities for both users and administrators to efficiently manage leave requests, employee information, and organizational processes. Avkash aims to provide a centralized platform for efficient organizational management.

## Tech Stack
**UI Frameworks:** ReactJs, Radix UI, Tailwind CSS

**Backend:** Python, FastAPI

**Database:** MongoDB

**Authentication:** Clerk

**API Communication:** Rest APIs

## Getting started
### 1. Clone this Repository
Clone this repository using:

```bash
$ git clone git@github.com:positsource/Avkash.git
```

### 2. Download and install dependencies
- **Navigate to:**
```bash
$ cd Avkash
```

### Frontend setup
Install the concurrently package as a development dependency (enables running multiple scripts during development):

```bash
$ npm install concurrently --save-dev
```

- **Navigate to:**
```bash
$ cd client
```
Install frontend dependencies:

```bash
$ npm install
```

### 3. Run the App
- **Navigate to:**
```bash
$ cd Avkash
```
- Run this App using:
```bash
$ npm start
```

The app is now running. Navigate to http://localhost:3000/ in your browser to explore its UI.

---

## Backend Setup

The backend is located in the `server` directory and uses Poetry for dependency management and Make for automation.

### Prerequisites

- Python 3.10 or higher
- Poetry (https://python-poetry.org/docs/#installation)
- Make

### Poetry Setup

1. Navigate to the server directory:

### `cd server`

2. Install Poetry following the [official documentation](https://python-poetry.org/docs/#installation)

### `pip install poetry`

3. Install choclatey as make doesnt support window unless used with chocolatey(For Linu/MacOS no need to install chocolatey can skip step3)

### `npm install chocolatey`

4. Install Make 

### `choco install make`

(If make is not recognised then check with `where make`)

5. Install dependencies:

### `poetry install`

(If any issue with installing poetry then add python path in environment variable)


6. To set the lock file

### `poetry lock`


### Available Make Commands

The backend includes a Makefile to simplify common tasks:

- `make help` - Display all available commands
- `make install` - Install dependencies with Poetry
- `make run` - Run FastAPI server with uvicorn
- `make format` - Format code with black
- `make lint` - Check code formatting with black

### Running the Backend
### `cd server make run`
This will start the FastAPI server at http://localhost:8000


## Full Stack Development

To run both frontend and backend simultaneously:

### `npm start`

## Learn More

### Steps for training dataset foc document verification

1. Download the dataset from the link provided below.

https://huggingface.co/datasets/mahadevwaghmare/Document_validation_Dataset/tree/main

2. Rename the `Document_validation_Dataset` to `training_data`.

3. Add the dataset folder into `server/training_model` folder.

4. Go to server and run the following command to train the model.
`cd server` 
`python training_model/train_model.py`

