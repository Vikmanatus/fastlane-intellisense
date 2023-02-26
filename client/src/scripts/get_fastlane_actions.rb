# frozen_string_literal: true
require "fastlane"

def fetch_actions
  Fastlane::Actions.load_default_actions
end

puts fetch_actions

